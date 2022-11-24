var mysql = require('mysql');

var pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'images',
    password: 'images',
    database: 'images',
    debug: false
});

function releaseConnection(connection) {
    connection.removeListener('error', function(err) {
        errListener(err, "Error: couldn't release connection", connection, callback);
    });
    connection.release();
}

function errListener(err, errString, connection, callback) {
    releaseConnection(connection);
    callback({ error: "<p><b>" + errString + "</b></p><p>" + " " + err.code + "</p>" });
}

module.exports.uploadFile = function (image, callback) {
    pool.getConnection(function (err, connection) {

        function returnResult(err, result) {
            if (err) {
                errListener(err, "Error: couldn't upload image metadata", connection, callback);
                console.log(err);
            } else {
                releaseConnection(connection);
                callback({ id: result.insertId });
                console.log("inserted metadata: " + result.insertId);
            }
        }

        function uploadMetadata(err, result) {
            console.log("inserted image: " + result.insertId);
            if (err) {
                errListener(err, "Error: couldn't insert image", connection, callback);
                console.log(err);
                return;
            }
            connection.query(
                'INSERT INTO metadata '
                + 'VALUES (?, DEFAULT, ?, ?, ?);', [
                image.name,
                image.type,
                image.size,
                result.insertId
            ],
                returnResult
            );

        }

        if (err) {
            callback({ error: "Error couldn't get connection" });
            return;
        }
        connection.on('error', function(err) {
            errListener(err, "couldn't get file", connection, callback);
        });
        connection.query('INSERT INTO imagedata VALUES (NULL, ?);', [image.data], uploadMetadata);

    })
};

module.exports.fetchImage = function (id, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback({ error: "Error couldn't get connection" });
            return;
        }
        connection.on('error', function(err) {
            errListener(err, "Error: couldn't fetch image", connection, callback);
        });
        connection.query('SELECT type, size, data FROM metadata'
            + ' JOIN imagedata '
            + ' ON id = imageid '
            + ' WHERE id = ?;',
            [id], function (err, rows, fields) {
                if (err) {
                    errListener(err, "Error: couldn't fetch image", connection, callback);
                } else {
                    releaseConnection(connection);
                    callback(rows[0]);
                }
            });

    })
};

module.exports.listImages = function (callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            callback({ error: "Error couldn't get connection" });
            return;
        }
        connection.on('error', function(err) {
            errListener(err, "Error: couldn't fetch image", connection, callback);
        });
        connection.query('SELECT name, imageid FROM metadata ORDER BY created DESC;', function (err, rows, fields) {
            if (err) {
                errListener(err, "Error: couldn't fetch image", connection, callback);
            } else {
                releaseConnection(connection);
                callback(rows);
            }
        });

    });
};

