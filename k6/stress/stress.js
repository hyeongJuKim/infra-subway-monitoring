import http from 'k6/http';
import {check, group, sleep, fail} from 'k6';

export let options = {
    thresholds: {
        http_req_duration: ['p(99)<1000'], // 99% of requests must complete below 1s
    },
    stages: [
        {duration: '3m', target: 10},
        {duration: '3m', target: 20},
        {duration: '3m', target: 50},
        {duration: '3m', target: 100},
        {duration: '3m', target: 180},
        {duration: '3m', target: 320},
        {duration: '3m', target: 180},
        {duration: '3m', target: 100},
        {duration: '3m', target: 50},
        {duration: '3m', target: 20},
        {duration: '10s', target: 0},
    ],
};

const BASE_URL = 'https://hyeongjukim.o-r.kr';
const USERNAME = 'user@gmail.com';
const PASSWORD = '123';

export default function () {
    main();

    const authHeaders = login();
    retrievedMember(authHeaders)

    path();
    findPath(authHeaders);

    sleep(1);
};

function main() {
    const response = http.get(BASE_URL);

    check(response, {
        'main status 200': (res) => res.status === 200
    });
}

function login() {
    var payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    let loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });

    return {
        headers: {
            Authorization: `Bearer ${loginRes.json('accessToken')}`,
        },
    };
}

function retrievedMember(authHeaders) {
    let myObjects = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(myObjects, {'retrieved member': (obj) => obj.id != 0});
}

function path() {
    const response = http.get(`${BASE_URL}/path`);

    check(response, {
        'path status 200': (res) => res.status === 200
    });
}

function findPath(authHeaders) {
    const response = http.get(`${BASE_URL}/path?source=514&target=522`, authHeaders);

    check(response, {
        'find path status 200': (res) => res.status === 200
    });
}