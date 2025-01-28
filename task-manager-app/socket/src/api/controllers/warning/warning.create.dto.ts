import {IsNotEmpty} from "class-validator";

export class WarningCreateDto {

    @IsNotEmpty()
    message: string;

}