import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToken1685986618068 implements MigrationInterface {
  name = 'AddToken1685986618068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" ADD "token" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "token"`);
  }
}
