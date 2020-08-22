const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

//to serve Directory requests
const listDir = (checkPath, cb) => {
    fs.readdir(checkPath, (err, files) => {
        if (err) {
            if (err.code === 'ENOTDIR')
                return cb({ code: 400, message: 'path is file' }, null);
            else
                return cb({ code: 404, message: 'path does not exist' }, null);
        } else {
            const fArray = files.map(item => {
                const stat = fs.statSync(path.join(checkPath, item));
                return {
                    type: (stat.isDirectory() ? 'dir' : 'file'),
                    name: item,
                    size: stat.size
                };
            });
            return cb(null, fArray);
        }
    });
}

module.exports = listDir;