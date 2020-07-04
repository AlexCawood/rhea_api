const conn = require('../database')

describe('Test database connection', () => {
    test('', async ()=>{
        const test_conn = await conn("select (1+1) as test from DUAL")
        expect(test_conn[0].test).toBe(2);
    })
})

