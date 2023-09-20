const axios = require("axios").default;


{
    "code", "status", "message", "data";
}
async function axiosResponse(response) {
    console.log(response.message);
    if (response.status == 200) {
        return response.data;
    } else {
        return false;
    }
}
module.exports = {
    post: async (endpoint, bodyData, token) => {
        let config = {
            method: "post",
            url: endpoint,
            headers: {
                "Content-Type": "application/json",
            },
            data: bodyData,
        };
        if (token) {
            config.headers.Authorization = token
        }
        return axios(config)
            .then(function (response) {
                return axiosResponse(response);
            })
            .catch(function (error) {
                // console.log(error)
                return axiosResponse(error);
            });
    },
    get: async (endpoint, token) => {
        let config = {
            method: "get",
            url: endpoint,
            headers: {
                "Content-Type": "application/json",
            },
        };
        if (token) {
            config.headers.Authorization = token
        }
        return axios(config)
            .then(function (response) {
                return axiosResponse(response);
            })
            .catch(function (error) {
                return axiosResponse(error);
            });
    },
};
