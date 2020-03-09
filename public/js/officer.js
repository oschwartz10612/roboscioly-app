$("#mainform").submit(function(e) {
  e.preventDefault();
  $.ajax({
    url: "/profile/form",
    type: "post",
    data: $("#mainform").serialize(),
    success: function() {
      $("#sucsess").show();
      $("html,body").scrollTop(0);
      $(".alert")
        .delay(4000)
        .slideUp(200, function() {
          $(this).hide();
        });
    },
    error: function() {
      $("#error").show();
      $(".alert")
        .delay(4000)
        .slideUp(200, function() {
          $(this).hide();
        });
    }
  });
});

$("#math_teacher").change(function() {
    var math_teacher = $("#math_teacher option:selected").val();
    if (math_teacher != "None") {
      $("#science_teacher").val("None");
    }
});

$("#science_teacher").change(function() {
    var science_teacher = $("#science_teacher option:selected").val();
    if (science_teacher != "None") {
        $("#math_teacher").val("None");
    }
});

/* eslint-disable no-unused-vars */

function submit() {
    document.getElementById("submit").click();
}

function finalSubmit() {
  var pass = true;

  var math_teacher = $("#math_teacher option:selected").val();
  var science_teacher = $("#science_teacher option:selected").val();
  if (math_teacher == "None" && science_teacher == "None") {
    pass = false;
  }

  if (!pass) {
    alert("You have not completed all required fields!");
  } else {
    var r = confirm("Are you sure you want to submit now?");
    if (r == true) {
      $("#mainform").prepend(
        '<input type="hidden" name="final" value="final">'
      );
      $.ajax({
        url: "/profile/form",
        type: "post",
        data: $("#mainform").serialize(),
        success: function() {
          location.reload();
        },
        error: function() {
          $("#error").show();
          $(".alert")
            .delay(4000)
            .slideUp(200, function() {
              $(this).hide();
            });
        }
      });
    }
  }
}


