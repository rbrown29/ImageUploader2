function DropHandler(target, progressDialog) {
    var dragCount = 0;
    function handleUpload(file) {
        var ui = new FileUploadUI(progressDialog);
        var handler = new FileUploadHandler(file, ui);
        ui.addStatus();

        if (file.type.indexOf("image") == -1) {
            ui.cancel();
        }

        console.log("Name: " + file.name + " Type: " + file.type + " Size: " + file.size + " Date: " + file.lastModifiedDate);

    }

    function init () {
        target.on("dragover", function (event) {
            event.preventDefault();
            event.stopPropagation();
        });

        target.on("dragenter", function (event) {
            event.preventDefault();
            event.stopPropagation();
            dragCount++;
            console.log("dragenter: " + event + " dragCount: " + dragCount);
            if (dragCount == 1) {
                progressDialog.show();
            }
        });

        target.on("dragleave", function (event) {
            event.preventDefault();
            event.stopPropagation();
            dragCount--;
            console.log("dragleave: " + event + " dragCount: " + dragCount);
            if (dragCount == 0) {
                progressDialog.hide();
            }
        });

        target.on("drop", function (event) {
            var files = event.originalEvent.dataTransfer.files;
            var i;
            event.preventDefault();
            event.stopPropagation();
            dragCount = 0;
            console.log("drop: " + event + " dragCount: " + dragCount);
            for (i = 0; i < files.length; i++) {
                handleUpload(files[i]);
            }
        });
    }
    init();
}