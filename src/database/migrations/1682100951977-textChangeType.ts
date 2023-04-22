import { MigrationInterface, QueryRunner } from "typeorm";

export class TextChangeType1682100951977 implements MigrationInterface {
    name = 'TextChangeType1682100951977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "text"`);
        await queryRunner.query(`ALTER TABLE "item" ADD "text" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "text"`);
        await queryRunner.query(`ALTER TABLE "item" ADD "text" character varying`);
    }

}
