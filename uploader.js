$(function () {
    
        var imageUI = new ImageUI();
       var progressDialog = new ProgressDialog(imageUI);
       var drophandler = new DropHandler($(document), progressDialog);

        imageUI.fetchImages();
       $(document).tooltip({
            items: ".upload_progress_label",
            content: function () {
               return $(this).attr("title");
            }
       });

});