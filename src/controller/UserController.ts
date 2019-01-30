import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import * as bcrypt from "bcrypt-nodejs";
import { createJwtToken } from "../util/auth";
import { User } from "../entity/User";
import { UserRepository } from "../repository/UserRepository";
import { Controller, IController, Routes } from "./Controller";

export class UserController extends Controller implements IController {

    private userRepository: UserRepository;

    public init(app: any) {
        this.registerController(app, User, "user");
        this.userRepository = getCustomRepository(UserRepository);

        this.registerRoute(Routes.GET);
        this.registerRoute(Routes.GET_ALL);
        this.registerRoute(Routes.PUT);
        this.registerRoute(Routes.DELETE);
        this.registerRoute(Routes.POST, this.create.bind(this), false);
        this.registerRoute(Routes.POST, this.login.bind(this), false, "login");
    }

    /**
     * Signup
     * @param request Request
     * @param response Response
     */
    public async create(request: Request, response: Response) {
        const { email, password } = request.body;

        if (!email || !password ) {
            return response.status(400).send({message: "Not all parameters sent"});
        }

        const existingUser = await this.userRepository.findOne({email});
        if (existingUser) {
            return response.status(400).send({message: "Email already registered" });
        }

        const user = await this.userRepository.createAndSave(email, password);

        response.status(201).send({user, token: createJwtToken(user)});
    }

    public async login(request: Request, response: Response) {
        const { email, password } = request.body;

        if (!email || !password ) {
            return response.status(400).send({message: "Not all parameters sent"});
        }

        const user = await this.userRepository.findOne({email});
        if(!user) {
            return response.status(404).send({message: "No user found"});
        }

        const validPassword = bcrypt.compareSync(password, user.getPassword());
        if(!validPassword) {
            return response.status(401).send({message: "Wrong password"});
        }
        
        response.send({user, token: createJwtToken(user)});
    }

}
