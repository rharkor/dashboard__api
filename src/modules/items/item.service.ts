import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import Item from './entities/item.entity';
import { CreateItemDto } from './dtos/item-create.dto';
import { UpdateItemDto } from './dtos/item-update.dto';
import * as fs from 'fs';
import * as path from 'path';
import User from '../users/entities/user.entity';
import { decrypt, encrypt } from 'src/utils/crypto-utils';
import { v4 as uuid } from 'uuid';

export type ItemsFiles = {
  logo?: Express.Multer.File[];
  file?: Express.Multer.File[];
};

export const itemsList = ['group', 'link', 'view', 'copy', 'file', 'password'];

export type ItemWithFiles<T> = T & ItemsFiles;

const verifyItem = (item: ItemWithFiles<CreateItemDto | UpdateItemDto>) => {
  if (!item.type) return;
  // Ensure that type is correct
  if (!itemsList.includes(item.type)) {
    throw new BadRequestException('Invalid type');
  }

  // Ensure that if the type is group, there is no file and no text
  if (item.type === 'group' && (item.file || item.text)) {
    throw new BadRequestException('Group cannot have file and text');
  }

  // Ensure that there's not both a file and text
  if (item.file && item.text) {
    throw new BadRequestException('Either file or text is required');
  }

  // Ensure that if the type is file or view, there is a file
  if ((item.type === 'file' || item.type === 'view') && !item.file) {
    throw new BadRequestException('File is required');
  }

  // Ensure that if the type is not file or view, there is text
  if (
    (item.type === 'link' ||
      item.type === 'copy' ||
      item.type === 'password') &&
    !item.text
  ) {
    throw new BadRequestException('Text is required');
  }

  // Ensure there is either a file or text
  if (item.type !== 'group' && !item.file && !item.text) {
    throw new BadRequestException('Either file or text is required');
  }

  // Encode password with bcrypt and PASSWORD_ENCRYPTION_KEY
  if (item.type === 'password' && item.text) {
    item.text = encrypt(item.text);
  }
};

const getAllChildrenParent = async (
  item: Item,
  itemRepository: Repository<Item>,
) => {
  const children = await itemRepository.find({
    where: {
      parent: {
        id: item.id,
      },
    },
    relations: ['parent', 'children'],
  });
  if (children.length > 0) {
    for (const child of children) {
      const sub = await getAllChildrenParent(child, itemRepository);
      children.push(...sub);
    }
  }
  return children;
};

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
  ) {}

  findAll(user: User) {
    return this.itemRepository.find({
      where: {
        user,
        parent: IsNull(),
      },
      relations: ['parent', 'children'],
      select: ['id', 'name', 'type', 'text', 'logo', 'file', 'token'],
    });
  }

  async findAllByToken(token: string) {
    const root = await this.itemRepository.findOne({
      where: {
        token,
      },
      relations: ['parent', 'children'],
    });

    if (!root) {
      throw new BadRequestException('Invalid token');
    }

    return getAllChildrenParent(root, this.itemRepository);
  }

  async findOneItem(id: number, user: User) {
    const res = await this.itemRepository.findOne({
      where: {
        user,
        id,
      },
      relations: ['parent', 'children'],
      select: ['id', 'name', 'type', 'text', 'logo', 'file', 'token'],
    });
    if (res?.type === 'password' && res?.text) {
      res.text = decrypt(res.text);
    }
    return res;
  }

  async findOneItemByToken(id: number, token: string) {
    const root = await this.itemRepository.findOne({
      where: {
        token,
      },
    });
    if (!root) {
      throw new BadRequestException('Invalid token');
    }
    const rootChildren = await getAllChildrenParent(root, this.itemRepository);

    const res = rootChildren.find(
      (item) => item.id.toString() === id.toString(),
    );
    if (!res) {
      throw new BadRequestException('Invalid id');
    }

    if (res?.type === 'password' && res?.text) {
      res.text = decrypt(res.text);
    }
    return res;
  }

  async findParentItem(id: number, user: User) {
    const res = await this.itemRepository.findOne({
      where: {
        user,
        id,
      },
      select: ['id', 'name'],
    });
    const breadCrumb = [];
    if (res) {
      breadCrumb.push(res);
      let parent = await this.itemRepository.findOne({
        where: {
          user,
          id: res.id,
        },
        relations: ['parent'],
      });
      while (parent?.parent) {
        breadCrumb.push(parent.parent);
        parent = await this.itemRepository.findOne({
          where: {
            user,
            id: parent.parent.id,
          },
          relations: ['parent'],
        });
      }
    }
    return { ...res, parents: breadCrumb.reverse() };
  }

  async findParentItemByToken(id: number, token: string) {
    const root = await this.itemRepository.findOne({
      where: {
        token,
      },
      select: ['id', 'name'],
    });
    if (!root) {
      throw new BadRequestException('Invalid token');
    }
    const rootChildren = await getAllChildrenParent(root, this.itemRepository);
    const rootChildrenIds = rootChildren.map((item) => item.id.toString());
    if (
      !rootChildrenIds.includes(id.toString()) &&
      root.id.toString() !== id.toString()
    ) {
      throw new BadRequestException('Invalid id');
    }
    const res = await this.itemRepository.findOne({
      where: {
        id,
      },
      select: ['id', 'name'],
      relations: ['parent'],
    });
    const breadCrumb = [];
    if (res) {
      breadCrumb.push(res);
      let parent: Item | null = res;
      while (parent?.parent) {
        breadCrumb.push(parent.parent);
        parent =
          rootChildren.find((item) => item.id === parent?.parent?.id) || null;
      }
    }
    return { id: res?.id, name: res?.name, parents: breadCrumb.reverse() };
  }

  findByItem(id: number, user: User) {
    return this.itemRepository.find({
      where: {
        user,
        parent: {
          id,
        },
      },
      relations: ['parent', 'children'],
    });
  }

  async findByItemByToken(id: number, token: string) {
    const root = await this.itemRepository.findOne({
      where: {
        token,
      },
    });
    if (!root) {
      throw new BadRequestException('Invalid token');
    }
    if (root.id.toString() !== id.toString()) {
      const rootChildren = await getAllChildrenParent(
        root,
        this.itemRepository,
      );
      let parentAccess = false;
      for (const child of rootChildren) {
        if (child.id.toString() === id.toString()) {
          parentAccess = true;
          break;
        }
      }
      if (!parentAccess) {
        throw new BadRequestException('Invalid token');
      }
    }

    const items = await this.itemRepository.find({
      where: {
        parent: {
          id,
        },
      },
      relations: ['parent', 'children'],
    });
    return items;
  }

  create(createItemDto: ItemWithFiles<CreateItemDto>, user: User) {
    verifyItem(createItemDto);
    return this.itemRepository.save({
      user,
      parent: createItemDto.parent
        ? JSON.parse(createItemDto.parent as unknown as string)
        : undefined,
      file: createItemDto.file,
      text: createItemDto.text,
      name: createItemDto.name,
      type: createItemDto.type,
      logo: createItemDto.logo,
    });
  }

  generateToken(id: number, user: User) {
    return this.itemRepository.update(
      {
        id,
        user,
      },
      {
        token: uuid(),
      },
    );
  }

  update(id: number, updateItemDto: ItemWithFiles<UpdateItemDto>, user: User) {
    verifyItem(updateItemDto);
    const item = this.itemRepository.findOne({
      where: {
        id,
        user,
      },
    });
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    return this.itemRepository.update(id, {
      file: updateItemDto.file,
      text: updateItemDto.text,
      name: updateItemDto.name,
      type: updateItemDto.type,
      logo: updateItemDto.logo,
    });
  }

  remove(id: number, user: User) {
    return this.itemRepository.delete({
      id,
      user,
    });
  }

  async removeGroup(id: number, user: User) {
    const group = await this.itemRepository.findOne({
      where: {
        id,
        user,
      },
      relations: ['children'],
    });
    if (!group) {
      throw new BadRequestException('Group not found');
    }
    const childrens = group.children ?? [];
    const promises = childrens.map((child) => {
      if (child.type === 'group') {
        return this.removeGroup(child.id, user);
      } else {
        return this.remove(child.id, user);
      }
    });
    await Promise.all(promises);
    return this.remove(id, user);
  }

  async cleanUnused() {
    Logger.log('Cleaning unused files');
    // Clean all files that are not used by any item
    const allItems = await this.itemRepository.find({
      select: ['logo', 'file'],
    });
    const allFiles = fs.readdirSync('upload');
    const usedFiles = new Set<string>();
    allItems.forEach((item) => {
      if (item.logo) usedFiles.add((item.logo as any)[0].filename);
      if (item.file) usedFiles.add((item.file as any)[0].filename);
    });
    const unusedFiles = allFiles.filter((file) => !usedFiles.has(file));
    unusedFiles.forEach((file) => {
      fs.unlinkSync(path.join('upload', file));
    });
    Logger.log(`Cleaned ${unusedFiles.length} files`);
  }

  async findOneByFile(file: string) {
    const allItems = await this.itemRepository.find({
      select: ['logo', 'file'],
    });
    const item = allItems.find((item) => {
      if (item.logo) {
        const filename = (item.logo as any)[0].filename;
        if (filename === file) return true;
      }
      if (item.file) {
        const filename = (item.file as any)[0].filename;
        if (filename === file) return true;
      }
      return false;
    });
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    const itemWithUser = await this.itemRepository.findOne({
      where: {
        id: item.id,
      },
      relations: ['user'],
    });
    if (!itemWithUser) {
      throw new BadRequestException('Item not found');
    }
    return itemWithUser;
  }

  async findOneByFileAndToken(file: string, token: string) {
    const root = await this.itemRepository.findOne({
      where: {
        token,
      },
    });
    if (!root) {
      throw new BadRequestException('Invalid token');
    }
    const rootChildren = await getAllChildrenParent(root, this.itemRepository);
    const item = rootChildren.find((item) => {
      if (item.logo) {
        const filename = (item.logo as any)[0].filename;
        if (filename === file) return true;
      }
      if (item.file) {
        const filename = (item.file as any)[0].filename;
        if (filename === file) return true;
      }
      return false;
    });
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    const itemWithUser = await this.itemRepository.findOne({
      where: {
        id: item.id,
      },
      relations: ['user'],
    });
    if (!itemWithUser) {
      throw new BadRequestException('Item not found');
    }
    return itemWithUser;
  }

  async findOneByLogo(logo: string) {
    const allItems = await this.itemRepository.find({
      select: ['logo', 'file'],
    });
    const item = allItems.find((item) => {
      if (item.logo) {
        const filename = (item.logo as any)[0].filename;
        if (filename === logo) return true;
      }
      return false;
    });
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    const itemWithUser = await this.itemRepository.findOne({
      where: {
        id: item.id,
      },
      relations: ['user'],
    });
    if (!itemWithUser) {
      throw new BadRequestException('Item not found');
    }
    return itemWithUser;
  }

  async moveItem(id: number, parentId: number, user: User) {
    const item = await this.itemRepository.findOne({
      where: {
        id,
        user,
      },
    });
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    if (parentId === -1) {
      return this.itemRepository
        .createQueryBuilder()
        .update(Item)
        .set({ parent: null })
        .where('id = :id', { id })
        .execute();
    } else {
      const parent = await this.itemRepository.findOne({
        where: {
          id: parentId,
          user,
          type: 'group',
        },
      });
      if (!parent) {
        throw new BadRequestException('Parent not found');
      }
      item.parent = parent;
      return this.itemRepository.save(item);
    }
  }
}
