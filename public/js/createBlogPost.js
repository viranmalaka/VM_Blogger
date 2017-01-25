/**
 * Created by malaka on 1/21/17.
 */
var uploadImages = function () {
    $("#imgUploads").submit(function(e) {
        var url = "/posts/uploadImages"; // the script where you handle the form input.
        $.ajax({
            type: "POST",
            url: url,
            data: $("#imgUploads").serialize(), // serializes the form's elements.
            success: function(data)
            {
                alert(data); // show response from the php script.
            }
        });
        e.preventDefault(); // avoid to execute the actual submit of the form.
    });
};
//
// $(function(){
//     $('#slug').on('keyup', function(e){
//         console.log(e.keyCode);
//     });
// });

$(document).ready(function () {
    $('#tags').tagsinput({
        trimValue : true,
        confirmKeys : [32,13]
    });
});