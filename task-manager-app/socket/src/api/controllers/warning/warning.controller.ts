import 'reflect-metadata';
import {Request, Response} from 'express';
import {validateBody} from "../../../middleware/validation.middleware";
import {socketServer} from "../../../socket/socket.server";
import {WarningCreateDto} from "./warning.create.dto";

export class WarningController {

    async create(req: Request, res: Response) {
        const dto = await validateBody(req, WarningCreateDto)
        socketServer.broadcastWarning(dto)
        res.status(201).send(dto)
    }

}
