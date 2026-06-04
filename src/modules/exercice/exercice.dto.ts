import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateExerciceDto {

    @ApiProperty({ example: 'Exercice 2026' })
    @IsString()
    @IsNotEmpty()
    libelle!: string;

    @ApiProperty({ example: '2026-01-01' })
    @IsDateString()
    @IsNotEmpty()
    date_debut!: string;

    @ApiProperty({ example: '2026-12-31', required: false })
    @IsDateString()
    @IsOptional()
    date_fin?: string;

}

export class UpdateExerciceDto {

    @ApiProperty({ example: 'Exercice 2026 update', required: false })
    @IsString()
    @IsOptional()
    libelle?: string;

    @ApiProperty({ example: '2026-12-31', required: false })
    @IsDateString()
    @IsOptional()
    date_fin?: string;

}