class ApiResponse {
    constructor(status, data, message) {
        this.status = status;
        this.success = true;
        this.message = message;
        if (data) this.data = data;
    }
}

export default ApiResponse;
