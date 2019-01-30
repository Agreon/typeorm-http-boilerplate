import { EntityRepository, Repository } from "typeorm";
import { validate } from "class-validator";
import { User } from "../entity/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    // TODO: how to throw errors
    public async createAndSave(email: string, password: string) {
        const user = new User();
        user.email = email;
        user.setPassword(password);

        /*const errors = await validate(user);

        if (errors.length > 0) {
            throw {errors};
        }*/

        return await this.save(user);
    }
}
