export function httpResponse(
    success: boolean,
    data: any,
    message: string,
    code: number
) {
    return {
        success,
        data,
        message,
        code,
        timestamp: new Date().toISOString()
    }
};

export function httpResponsePaginated(
    success: boolean,
    data: any = null,
    message = '',
    code = 200,
    total: number = 0,
    page: number = 1,
    limit: number = 10,
) {
    const lastPage = Math.ceil(total / limit);
    const hasNextPage = page < lastPage;
    const hasPreviousPage = page > 1;
    return {
        ...httpResponse(success, data, message, code),
        meta: {
            total,
            page,
            limit,
            lastPage,
            hasNextPage,
            hasPreviousPage,
        },
    };
}