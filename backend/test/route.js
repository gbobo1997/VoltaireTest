class TestRoute{
    constructor(route, type, token_model){
        this.route = route;
        this.type = type;
        this.token_model = token_model;
    }

    getRequestType(request){
        if (this.type === 'GET') return request.get(this.route);
        else if (this.type === 'POST') return request.post(this.route);
        else if (this.type === 'PUT') return request.put(this.route);
        else if (this.type === 'PATCH') return request.patch(this.route);
        else return request.delete(this.route);
    }

    addToken(request, token){
        return request.set('x-access-token', token);
    }

    ExecuteTest
}