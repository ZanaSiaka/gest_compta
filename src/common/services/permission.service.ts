import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Module } from "../../../generated/prisma/enums";

export type Permission = 'can_read' | 'can_write' | 'can_delete' | 'can_update' | 'can_validate' | 'can_export';

@Injectable()
export class PermissionService {
    constructor(private readonly prisma: PrismaService) { }

    async hasPermission(role_id: string, module: Module, action: Permission): Promise<boolean> {

        const role = await this.prisma.role.findUnique({
            where: { role_id },
            select: { nom: true }
        });

        if (!role) return false;
        if (role.nom === 'ADMIN') return true;

        const permission = await this.prisma.permission.findFirst({
            where: { role_id, module }
        });

        if (!permission) return false;
        return permission[action] === true;

    }
}