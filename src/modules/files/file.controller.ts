import { Controller, Get, Param, Query, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { FileService } from './file.service';
import { RequestWithUser } from 'src/types';
import * as path from 'path';
import { Public, TokenAvailable } from 'src/meta/public.meta';

@Controller('upload')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get(':file')
  @TokenAvailable()
  async serveFile(
    @Param('file') file: string,
    @Res() res: Response,
    @Request() req: RequestWithUser,
    @Query('token') token: string,
  ) {
    await this.fileService.ensureFileExist(file);
    if (token) {
      await this.fileService.ensureHaveRightsByToken(file, token);
    } else {
      await this.fileService.ensureHaveRights(file, req.user);
    }
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
