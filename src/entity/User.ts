import * as bcrypt from "bcrypt-nodejs";
import { IsEmail } from "class-validator";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  @IsEmail()
  public email: string;

  @CreateDateColumn()
  public created: Date;

  @Column({
    select: false
  })
  private password: string;

  // generating a hash
  public setPassword(password) {
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  }

  public getPassword() {
    return this.password;
  }
}
