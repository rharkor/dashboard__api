import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItems1682079204134 implements MigrationInterface {
    name = 'AddItems1682079204134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "name" character varying NOT NULL, "logo" jsonb, "text" character varying, "file" jsonb, "parentId" integer, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_2e3b654a1f669d356e259e7ca3c" FOREIGN KEY ("parentId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_2e3b654a1f669d356e259e7ca3c"`);
        await queryRunner.query(`DROP TABLE "item"`);
    }

}
