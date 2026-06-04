import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { TypeTiers } from "../../../generated/prisma/enums";

export class CreateTiersDto {

    @ApiProperty({ example: 'IT INNOV', required: true })
    @IsString()
    @IsNotEmpty()
    raison_sociale!: string;

    @ApiProperty({ example: '0123456789', required: true })
    @IsString()
    @IsOptional()
    nif?: string;

    @ApiProperty({ example: 'RCC-2024-001' })
    @IsString()
    @IsOptional()
    rccm?: string;

    @ApiProperty({ example: 'Rue Addis Abeba' })
    @IsString()
    @IsNotEmpty()
    adresse!: string;

    @ApiProperty({ example: '+225 07 75 92 9035' })
    @IsString()
    @IsNotEmpty()
    telephone!: string;

    @ApiProperty({ example: 'tiers@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ enum: TypeTiers, default: TypeTiers.CLIENT, required: false })
    @IsEnum(TypeTiers)
    @IsOptional()
    type?: TypeTiers;

    @ApiProperty({ default: false, required: false })
    @IsBoolean()
    @IsOptional()
    est_airsi?: boolean;

}

export class UpdateTiersDto extends PartialType(CreateTiersDto) { }