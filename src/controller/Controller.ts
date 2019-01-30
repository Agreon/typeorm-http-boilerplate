import { Request, Response } from "express";
import { validate } from "class-validator";
import { getRepository, ObjectType, Repository } from "typeorm";
import { verifyToken } from "../util/auth";

export const Method = {
  DELETE: "delete",
  GET: "get",
  POST: "post",
  PUT: "put"
};

export enum Routes {
  GET = "GET",
  GET_ALL = "GET_ALL",
  PUT = "PUT",
  POST = "POST",
  DELETE = "DELETE"
}

export interface IController {
  init: (app: any) => void;
}

export class Controller<T> {
  protected repository: Repository<ObjectType<T>>;

  private app: any;
  private className: string;

  private methods = {
    DELETE: {
      action: this.delete.bind(this),
      method: Method.DELETE,
      pathExt: "/:id"
    },
    GET: {
      action: this.get.bind(this),
      method: Method.GET,
      pathExt: "/:id"
    },
    GET_ALL: {
      action: this.getAll.bind(this),
      method: Method.GET,
      pathExt: ""
    },
    POST: {
      action: this.post.bind(this),
      method: Method.POST,
      pathExt: ""
    },
    PUT: {
      action: this.put.bind(this),
      method: Method.PUT,
      pathExt: "/:id"
    }
  };

  public async get(request: Request, response: Response) {
    const { id, user } = request.params;

    const entity = await this.repository.findOne(
      id,
      user ? { where: { user } } : null
    );

    if (!entity) {
      return response.status(404).end();
    }

    response.send(entity);
  }

  public async getAll(request: Request, response: Response) {
    const { user } = request.params;
    const objects = await this.repository.find(
      user ? { where: { user } } : null
    );
    response.send(objects);
  }

  public async post(request: Request, response: Response) {
    let { body } = request;
    body.user = request.params.user;

    const entity = await this.repository.create(body);

    const errors = await validate(entity);
    if (errors.length > 0) {
      console.log(errors);
      return response.status(400).send(errors.map(e => e.constraints));
    }

    try {
      await this.repository.save(entity);
    } catch (e) {
      return response.status(400).send(e.message);
    }

    response.status(201).send(entity);
  }

  public async put(request: Request, response: Response) {
    const { id, user } = request.params;
    const update = request.body;
    const existingEntity = await this.repository.findOne(
      id,
      user ? { where: { user } } : null
    );

    if (!existingEntity) {
      return response.status(404).end();
    }
    // Apply the update
    this.repository.merge(existingEntity, update);

    // Validation
    const errors = await validate(existingEntity);
    if (errors.length > 0) {
      console.log(errors);
      return response.status(400).send(errors.map(e => e.constraints));
    }

    await this.repository.save(existingEntity);
    response.send(existingEntity);
  }

  public async delete(request: Request, response: Response) {
    const { id, user } = request.params;
    const existingEntity = await this.repository.findOne(
      id,
      user ? { where: { user } } : null
    );

    if (!existingEntity) {
      return response.status(404).end();
    }

    await this.repository.remove(existingEntity);
    response.send(existingEntity);
  }

  protected registerController(
    app: any,
    entityClass: ObjectType<any>,
    className: string
  ) {
    this.app = app;
    this.repository = getRepository(entityClass);
    this.className = className;
  }

  protected registerRoute(
    route: Routes,
    action: (request: Request, response: Response) => Promise<any> = null,
    secured: boolean = true,
    customPath: string = this.className
  ) {
    const method = this.methods[route];
    const path = `/${customPath + method.pathExt}`;
    const actionToUse = action || method.action;

    if (secured) {
      this.app[method.method](path, verifyToken, this.callAction(actionToUse));
    } else {
      this.app[method.method](path, this.callAction(actionToUse));
    }

    console.log(`Registered ${route}: '${path}'; secured: ${secured}`);
  }

  private callAction(
    action: (request: Request, response: Response) => Promise<any>
  ) {
    return (request: Request, response: Response, next: (err: any) => void) => {
      action(request, response)
        .then(() => next)
        .catch(err => next(err));
    };
  }
}
