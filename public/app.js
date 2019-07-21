var currentArticleId;

// Grab the articles as a json
$.getJSON("/articles", function(data) {
    for (var i = 0; i < data.length; i++) {
        $("#articles").append("<p class='art' data-id='" + data[i]._id + "'>" + data[i].title + "<br /><a href='" + data[i].link + "' target='_blank'>Read Article</a></p>");
    }
});


function popComments(data){
    
    $("#comments").empty();
    $("#comments").append("<h3>Comments for: " + data.title + "</h3>");
    $("#comments").append("<hr>");

    // If there's are comments on the article
    if (data.comments.length > 0) {
        for(var i = 0; i < data.comments.length; i++){
            var commentDiv = $("<div>").addClass("comment");
            commentDiv.append("<p>Title: " + data.comments[i].title +"</p>");
            commentDiv.append("<p>Message: " + data.comments[i].body +"</p>");
            commentDiv.append("<button data-id='" + data.comments[i]._id + "' class='delete-comment'>Delete comment</button>")
            commentDiv.append("<hr>");
            $("#comments").append(commentDiv);
        }
    } else {
        var commentDiv = $("<div>").addClass("comment");
        commentDiv.append("<p><i>No comments yet...</i></p>");
        commentDiv.append("<hr>");
        $("#comments").append(commentDiv);
    }
    
    

    // An input to enter a new title
    $("#comments").append("<p>Comment title:</p>");
    $("#comments").append("<input id='titleinput' name='title' >");
    $("#comments").append("<p>Comment message:</p>");
    $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
    $("#comments").append("<br>");
    $("#comments").append("<button data-id='" + currentArticleId + "' id='savecomment'>Add Comment</button>");
    
    
}

// Whenever someone clicks a p tag
$(document).on("click", "p.art", function() {

    var thisId = $(this).attr("data-id");
    currentArticleId = thisId;
    console.log("In article click: " + currentArticleId);
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    .then(function(data) {
        popComments(data);
    });
});

// When you click the savecomment button
$(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log("Button clicked this: " + thisId);
    console.log("Button clicked current: " + currentArticleId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            title: $("#titleinput").val(),
            // Value taken from note textarea
            body: $("#bodyinput").val()
        }
    })
    // With that done
    .then(function(saved) {
        // Log the response
        console.log(saved);

        console.log("Saved note: " + thisId);
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        .then(function(result) {
            popComments(result);
        });
    });

    $("#titleinput").val("");
    $("#bodyinput").val("");
});

// When you click a comment delete button
$(document).on("click", ".delete-comment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log("ID: " + thisId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "DELETE",
        url: "/comments/" + thisId
    })
    // With that done
    .then(function(data) {
        // Log the response
        console.log(data);
        
        $.ajax({
            method: "GET",
            url: "/articles/" + currentArticleId
        })
        .then(function(data) {
            popComments(data);
        });
    });

    $("#titleinput").val("");
    $("#bodyinput").val("");
});