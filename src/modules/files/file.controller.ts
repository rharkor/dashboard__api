import { Controller, Get, Param, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileService } from './file.service';
import { RequestWithUser } from 'src/types';
import * as path from 'path';
import { Public } from 'src/meta/public.meta';

@Controller('upload')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':file')
  async serveFile(
    @Param('file') file: string,
    @Res() res: Response,
    @Request() req: RequestWithUser,
  ) {
    await this.fileService.ensureFileExist(file);
    await this.fileService.ensureHaveRights(file, req.user);
    const absolutePath = path.join('upload', file);
    res.sendFile(absolutePath, { root: '.' });
  }

  @Get(':file/logo')
  @Public()
  async serveLogo(@Param('file') file: string, @Res() res: Response) {
    await this.fileService.ensureFileExist(file);
    await this.fileService.ensureIsLogo(file);
    const absolutePath = path.join('upload', file);
    res.sendFile(absolutePath, { root: '.' });
  }
}
