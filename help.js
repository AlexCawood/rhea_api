var x = rdata[tmpID]
if(!request.body.password &&  request.body.name){
    x['name'] = request.body.name
}else if (!request.body.username && request.body.password){
    x['password'] = request.body.password
}
else{
    x['name'] = request.body.name
    x['password'] = request.body.password
}