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

$(function(){
    $('#slug').on('keyup', function(e){
        var parameters = { slug: $(this).val() };
        $.get( '/checkSlug',parameters, function(data) {
            $('#slugLabel').html(data);
        });
    });
});

$(".select2-tags").select2({
    tags: true
});