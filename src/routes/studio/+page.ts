import type { PageLoad } from './$types';

function jsonToMap(json: string) {
    const jsonObj = JSON.parse(json);

    const map = new Map();

    for (const key in jsonObj) {
        if (typeof jsonObj[key] === 'object' && key !== "0") {
            map.set(key, jsonToMap(JSON.stringify(jsonObj[key])));
        } else {
            map.set(key, jsonObj[key]);
        }
    }

    return map;
}

export const load: PageLoad = () => {
    const initialRoot = {
        "workspace": {
            "0": {
                type: "dir",
                ino: 0,
                size: 0
            },
            "src": {
                "0": {
                    type: "dir",
                    ino: 0,
                    size: 0
                },
                "add.ts": {
                    "0": {
                        type: "file",
                        ino: 1,
                        size: 100
                    },
                }
            }
        }
    }

    const map = jsonToMap(JSON.stringify(initialRoot));
    console.log(map)

	return {
        "!root": map
    };
};