import User from '../../../modules/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
class Item {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  type: string; // itemList;

  @Column()
  name: string;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  logo?: object;

  // Item content
  @Column({
    nullable: true,
    type: 'text',
  })
  text?: string;

  @Column({
    nullable: true,
    type: 'jsonb',
  })
  file?: object;

  @ManyToOne(() => User)
  user: User;

  // Relation for group
  @ManyToOne(() => Item, (item) => item.children)
  parent?: Item;

  @OneToMany(() => Item, (item) => item.parent)
  children?: Item[];
}

export default Item;
