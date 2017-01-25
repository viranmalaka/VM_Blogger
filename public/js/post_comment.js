// Contact Form Scripts
Date.prototype.getFromFormat = function(format) {
    var yyyy = this.getFullYear().toString();
    format = format.replace(/yyyy/g, yyyy)
    var mm = (this.getMonth()+1).toString();
    format = format.replace(/mm/g, (mm[1]?mm:"0"+mm[0]));
    var dd  = this.getDate().toString();
    format = format.replace(/dd/g, (dd[1]?dd:"0"+dd[0]));
    var hh = this.getHours().toString();
    format = format.replace(/hh/g, (hh[1]?hh:"0"+hh[0]));
    var ii = this.getMinutes().toString();
    format = format.replace(/ii/g, (ii[1]?ii:"0"+ii[0]));
    var ss  = this.getSeconds().toString();
    format = format.replace(/ss/g, (ss[1]?ss:"0"+ss[0]));
    return format;
};


$(function() {

    $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var name = $("input#name").val();
            var email = $("input#email").val();
            var comment = $("textarea#comment").val();
            var post_id = $("input#post_id").val();
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: '/posts/addcomment',
                type: "POST",
                data: {
                    name: name,
                    email: email,
                    comment: comment,
                    post_id : post_id
                },
                cache: false,
                success: function(data) {
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("<strong>Your Comment has been submitted. </strong>");
                    $('#success > .alert-success')
                        .append('</div>');
                    data.created_at = new Date(data.created_at);
                    console.log(data.created_at.getFullYear());
                    $('.comment_div').append(
                        "<blockquote><ul style=\"list-style:none; font-size:18px\">"+
                        "<li style=\"margin-left:-40px;\" class=\"text-primary\">" +
                            data.name
                        + "<sub class=\"text-warning\" style='margin-left:10px'>" +
                            data.created_at.getFromFormat("hh:ii - yyyy-mm-dd")
                        + "</sub></li><li style=\"margin-left:-20px;\">" +
                            data.body
                        + "</li></ul></blockquote>"
                    );

                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function(err) {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry, Something went wrong. Please try again later!");
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                }
            });
        },
        filter: function() {
            return $(this).is(":visible");
        }
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


/*When clicking on Full hide fail/success boxes */
$('#name').focus(function() {
    $('#success').html('');
});


var submitLike = function () {
    var x = document.getElementById('chkLike');
    if(!x.checked){
        $.ajax({
            url:"/posts/submitLike",
            method: "POST",
            data : {
                post_id : $('input#post_id').val(),
                increase : true
            },
            cache : false,
            success : function (data) {
                $('#LikeNum').html(data.count);
                $('#icnLike').removeClass("fa-thumbs-o-up");
                $('#icnLike').addClass("fa-thumbs-o-down");
                $('#btnLike').removeClass("btn-info");
                $('#btnLike').addClass("btn-primary");
                x.checked = true;
            },
            error : function () {
                alert("Oops! Something went wrong.")
            }
        });
    }else{
        $.ajax({
            url:"/posts/submitLike",
            method: "POST",
            data : {
                post_id : $('input#post_id').val(),
                increase : false
            },
            cache : false,
            success : function (data) {
                $('#LikeNum').html(data.count);
                $('#icnLike').addClass("fa-thumbs-o-up");
                $('#icnLike').removeClass("fa-thumbs-o-down");
                $('#btnLike').addClass("btn-info");
                $('#btnLike').removeClass("btn-primary");
                x.checked = false;
            },
            error : function () {
                alert("Oops! Something went wrong.")
            }
        });
    }
};