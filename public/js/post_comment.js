// Contact Form Scripts

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
                    $('.comment_div').append(
                        "<blockquote><ul style=\"list-style:none; font-size:18px\">"+
                        "<li style=\"margin-left:-40px;\" class=\"text-primary\">" +
                            data.name
                        + "<sub class=\"text-warning\" style='margin-left:10px'>" +
                            //data.created_at.getHours() + ":" + data.created_at.getMinutes() + " - " +data.created_at.getYear() +
                            //+ " " + data.created_at.getMonth() + " " + data.created_at.getDate()
                            data.created_at.getUTCHours()
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
