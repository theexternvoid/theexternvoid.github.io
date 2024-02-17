// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Additional changes made on top of Microsoft's content are (c) theexternvoid user on GitHub.
// Licensed under the WTFPL.

// Contains code for event-based activation on Outlook on web, on Windows, and on Mac (new UI preview).

/**
 * Checks if signature exists.
 * If not, displays the information bar for user.
 * If exists, insert signature into new item (appointment or message).
 * @param {*} eventObj Office event object
 * @returns
 */
function checkSignature(eventObj) {
  let user_info_str = Office.context.roamingSettings.get("user_info");
  if (!user_info_str) {
    display_insight_infobar();
  } else {
    let user_info = JSON.parse(user_info_str);

    if (Office.context.mailbox.item.getComposeTypeAsync) {
      //Find out if the compose type is "newEmail", "reply", or "forward" so that we can apply the correct template.
      Office.context.mailbox.item.getComposeTypeAsync(
        {
          asyncContext: {
            user_info: user_info,
            eventObj: eventObj,
          },
        },
        function (asyncResult) {
          if (asyncResult.status === "succeeded") {
            insert_auto_signature(
              asyncResult.value.composeType,
              asyncResult.asyncContext.user_info,
              asyncResult.asyncContext.eventObj
            );
          }
        }
      );
    } else {
      // Appointment item. Just use newMail pattern
      let user_info = JSON.parse(user_info_str);
      insert_auto_signature("newMail", user_info, eventObj);
    }
  }
}

/**
 * For Outlook on Windows and on Mac only. Insert signature into appointment or message.
 * Outlook on Windows and on Mac can use setSignatureAsync method on appointments and messages.
 * @param {*} compose_type The compose type (reply, forward, newMail)
 * @param {*} user_info Information details about the user
 * @param {*} eventObj Office event object
 */
function insert_auto_signature(compose_type, user_info, eventObj) {
  let template_name = get_template_name(compose_type);
  let signature_info = get_signature_info(template_name, user_info);
  addTemplateSignature(signature_info, eventObj);
}

/**
 * 
 * @param {*} signatureDetails object containing:
 *  "signature": The signature HTML of the template,
    "logoBase64": The base64 encoded logo image,
    "logoFileName": The filename of the logo image
 * @param {*} eventObj 
 * @param {*} signatureImageBase64 
 */
function addTemplateSignature(signatureDetails, eventObj, signatureImageBase64) {
  if (is_valid_data(signatureDetails.logoBase64) === true) {
    //If a base64 image was passed we need to attach it.
    Office.context.mailbox.item.addFileAttachmentFromBase64Async(
      signatureDetails.logoBase64,
      signatureDetails.logoFileName,
      {
        isInline: true,
      },
      function (result) {
        //After image is attached, insert the signature
        Office.context.mailbox.item.body.setSignatureAsync(
          signatureDetails.signature,
          {
            coercionType: "html",
            asyncContext: eventObj,
          },
          function (asyncResult) {
            asyncResult.asyncContext.completed();
          }
        );
      }
    );
  } else {
    //Image is not embedded, or is referenced from template HTML
    Office.context.mailbox.item.body.setSignatureAsync(
      signatureDetails.signature,
      {
        coercionType: "html",
        asyncContext: eventObj,
      },
      function (asyncResult) {
        asyncResult.asyncContext.completed();
      }
    );
  }
}

/**
 * Creates information bar to display when new message or appointment is created
 */
function display_insight_infobar() {
  Office.context.mailbox.item.notificationMessages.addAsync("fd90eb33431b46f58a68720c36154b4a", {
    type: "insightMessage",
    message: "Please set your signature with the Office Add-ins sample.",
    icon: "Icon.16x16",
    actions: [
      {
        actionType: "showTaskPane",
        actionText: "Set signatures",
        commandId: get_command_id(),
        contextData: "{''}",
      },
    ],
  });
}

/**
 * Gets template name (A,B) mapped based on the compose type
 * @param {*} compose_type The compose type (reply, forward, newMail)
 * @returns Name of the template to use for the compose type
 */
function get_template_name(compose_type) {
  if (compose_type === "reply") return Office.context.roamingSettings.get("reply");
  if (compose_type === "forward") return Office.context.roamingSettings.get("forward");
  return Office.context.roamingSettings.get("newMail");
}

/**
 * Gets HTML signature in requested template format for given user
 * @param {\} template_name Which template format to use (A,B)
 * @param {*} user_info Information details about the user
 * @returns HTML signature in requested template format
 */
function get_signature_info(template_name, user_info) {
  return (template_name === "templateA") ? get_template_A_info(user_info) : get_template_B_info(user_info);
}

/**
 * Gets correct command id to match to item type (appointment or message)
 * @returns The command id
 */
function get_command_id() {
  if (Office.context.mailbox.item.itemType == "appointment") {
    return "MRCS_TpBtn1";
  }
  return "MRCS_TpBtn0";
}

/**
 * Gets HTML string for template A
 * Embeds the signature logo image into the HTML string
 * @param {*} user_info Information details about the user
 * @returns Object containing:
 *  "signature": The signature HTML of template A,
    "logoBase64": null since there is no image,
    "logoFileName": null since there is no image
 */
function get_template_A_info(user_info) {
  let str = "";
  str += "<p class='MsoNormal'><o:p>&nbsp;</o:p></p>";
  str += "<p class='MsoNormal' style='mso-margin-top-alt:auto;mso-margin-bottom-alt:auto'><span style='font-size:8.5pt;font-family:&quot;Arial&quot;,sans-serif;color:#333333;mso-ligatures:none'>:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::<o:p></o:p></span></p>";
  str += "<p class='MsoNormal' style='mso-margin-top-alt:auto;mso-margin-bottom-alt:auto'><b><span style='font-size:9.0pt;font-family:&quot;Arial&quot;,sans-serif;color:#333333;mso-ligatures:none'>FORRESTER</span></b><span style='font-size:8.5pt;font-family:&quot;Arial&quot;,sans-serif;color:#333333;mso-ligatures:none'><br>";
  str += "</span><span style='font-size:7.5pt;font-family:&quot;Arial&quot;,sans-serif;color:#3BB982;mso-ligatures:none'>BOLD AT WORK</span><span style='font-size:8.5pt;font-family:&quot;Arial&quot;,sans-serif;color:#333333;mso-ligatures:none'><o:p></o:p></span></p>";
  str += "<p class='MsoNormal' style='mso-margin-top-alt:auto;mso-margin-bottom-alt:auto'><b><span style='font-size:8.5pt;font-family:&quot;Arial&quot;,sans-serif;color:#333333;mso-ligatures:none'>" + user_info.name + "</span></b><span style='font-size:8.5pt;font-family:&quot;Arial&quot;,sans-serif;color:#333333;mso-ligatures:none'><br>";
  str += user_info.job + "&nbsp|&nbsp" + (is_valid_data(user_info.phone) ? "Office landline: " + user_info.phone + "&nbsp|&nbsp;" : "") + "<a href='mailto:" + user_info.email + "'><span style='color:blue'>" + user_info.email + "</span></a><br>";
  str += (is_valid_data(user_info.blog_link) ? "<a href='" + user_info.blog_link + "'><span style='color:blue'>My blog</span></a>&nbsp;|&nbsp;" : "") + (is_valid_data(user_info.linkedin_link) ? "<a href='"+user_info.linkedin_link+"'><span style='color:blue'>LinkedIn profile</span></a>&nbsp;|&nbsp;" : "" ) + "<a href='"+user_info.follow_reseach_link+"'><span style='color:blue'>Follow my latest research</span></a><br />";
  str += "<br>"
  str += "<b>Forrester Research, Inc.</b><br>"
  str += "60 Acorn Park Drive, Cambridge, MA 02140 United States<br>"
  str += "<a href='http://www.forrester.com/'><span style='color:blue'>Forrester.com</span></a>&nbsp;|&nbsp;<a href='http://blogs.forrester.com/'><span style='color:blue'>Blogs</span></a>&nbsp;|&nbsp;<a href='http://forr.com/what-it-means'><span style='color:blue'>Podcasts</span></a>&nbsp;|&nbsp;<a href='http://twitter.com/forrester'><span style='color:blue'>X</span></a>&nbsp;|&nbsp;<a href='http://linkedin.com/company/forrester-research'><span style='color:blue'>LinkedIn</span></a>&nbsp;|&nbsp;<a href='http://www.youtube.com/user/forresterresearch'><span style='color:blue'>YouTube</span></a>&nbsp;|&nbsp;<a href='https://www.instagram.com/forrester_global/'><span style='color:blue'>Instagram</span></a><o:p></o:p></span></p>"
  str += "<p class='MsoNormal'><span style='font-size:7.0pt;font-family:&quot;Arial&quot;,sans-serif;mso-ligatures:none'><o:p>&nbsp;</o:p></span></p>"
  str += "<p class='MsoNormal'><span style='font-size:7.0pt;font-family:&quot;Arial&quot;,sans-serif;mso-ligatures:none'>" + get_random_quote(user_info) + "<o:p></o:p></span></p>"
  str += "<p class='MsoNormal'><o:p>&nbsp;</o:p></p>"

  return {
    signature: str,
    logoBase64: null,
    logoFileName: null,
  };
}

/**
 * Gets HTML string for template B
 * @param {*} user_info Information details about the user
 * @returns Object containing:
 *  "signature": The signature HTML of template C,
    "logoBase64": null since there is no image,
    "logoFileName": null since there is no image
 */
function get_template_B_info(user_info) {
  let str = "";
  if (is_valid_data(user_info.greeting)) {
    str += user_info.greeting + "<br/>";
  }

  str += user_info.name;

  return {
    signature: str,
    logoBase64: null,
    logoFileName: null,
  };
}

/**
 * Validates if str parameter contains text.
 * @param {*} str String to validate
 * @returns true if string is valid; otherwise, false.
 */
function is_valid_data(str) {
  return str !== null && str !== undefined && str !== "";
}

/**
 * Gets a quote to embed in the signature
 * @param {*} user_info Information details about the user
 * @returns The quote text with quotation marks escaped for HTML
 */
function get_random_quote(user_info) {
  return (Math.random() < .5 ? get_random_nerdy_quote() : get_random_philosophical_quote()).replace('"', '&quot;').replace('\'', '&apos;');
}

/**
 * Gets a nerdy quote to embed in the signature
 * @param {*} user_info Information details about the user
 * @returns The nerdy quote text without quotation marks escaped for HTML
 */
function get_random_nerdy_quote(user_info) {
  var nerdyQuotes = user_info.nerdy_quotes.split('\n');
  return nerdyQuotes[Math.floor(Math.random() * philosophicalQuotes.length)];
}

/**
 * Gets a philosophical quote to embed in the signature
 * @param {*} user_info Information details about the user
 * @returns The philosophical quote text without quotation marks escaped for HTML
 */
function get_random_philosophical_quote(user_info) {
  var philosophicalQuotes = user_info.philosophical_quotes.split('\n');
  return philosophicalQuotes[Math.floor(Math.random() * philosophicalQuotes.length)];
}

Office.actions.associate("checkSignature", checkSignature);