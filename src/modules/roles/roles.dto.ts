import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

export class PermissionsDto {
    @ApiProperty({ example: 'TIERS' })
    @IsString()
    @IsNotEmpty()
    module!: string;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    can_read?: boolean = false;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    can_write?: boolean = false;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    can_delete?: boolean = false;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    can_update?: boolean = false;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    can_validate?: boolean = false;

    @ApiProperty({ default: false })
    @IsBoolean()
    @IsOptional()
    can_export?: boolean = false;
}

export class UpdatePermissionsDto {
    @ApiProperty({ type: [PermissionsDto] })
    permissions!: PermissionsDto[];
}