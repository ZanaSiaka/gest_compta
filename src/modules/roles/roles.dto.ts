import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'The name of the role', required: true })
    @IsString()
    @IsNotEmpty()
    nom!: string;

    @ApiProperty({ example: 'Administrateur avec tous les droits', description: 'The description of the role', required: false })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdateRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'The name of the role', required: false })
    @IsString()
    @IsOptional()
    nom?: string;

    @ApiProperty({ example: 'Administrateur avec tous les droits', description: 'The description of the role', required: false })
    @IsString()
    @IsOptional()
    description?: string;
}