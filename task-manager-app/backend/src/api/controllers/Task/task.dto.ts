// src/api/controllers/Task/task.dto.ts
import { IsNotEmpty, IsString, IsEnum, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CommentDto {
    @IsString()
    @IsNotEmpty()
    userId: string; // Username

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class TaskDto {
    @IsString()
    @IsNotEmpty()
    teamId: string; // Team name

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(['Pending', 'In Progress', 'Completed'])
    status: string;

    @IsEnum(['Low', 'Medium', 'High'])
    priority: string;

    @IsString()
    @IsNotEmpty()
    assignedTo: string; // Username

    @IsString()
    @IsNotEmpty()
    createdBy: string; // Username

    @IsDateString()
    dueDate: string; // ISO Date string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CommentDto)
    comments: CommentDto[];
}
