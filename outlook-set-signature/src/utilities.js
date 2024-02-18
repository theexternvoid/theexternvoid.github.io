// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Additional changes made on top of Microsoft's content are (c) theexternvoid user on GitHub.
// Licensed under the WTFPL.

function is_valid_data(str)
{
  return str !== null
	  && str !== undefined
	  && str !== "";
}

function get_cal_offset()
{
  return "<br/><br/>";
}

function get_template_A_base_str(user_info, quote)
{
  let str = "";
  str += '<div style="font:11px Arial, Verdana, sans-serif;color:#333">';
  str += '<p>:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::</p>';
  str += '<p><strong><span style="font-size:12.25px">FORRESTER</span></strong><br/>';
  str += '<span style="font:10px Arial, Verdana, sans-serif;color: #3BB982;">BOLD AT WORK</span></p>';
  str += '<p><strong>' + user_info.name + '</strong><br/>';
  str += user_info.job_title + (is_valid_data(user_info.phone) ? ' | Office landline: ' + user_info.phone : '') + ' | <a href="' + user_info.email + '">' + user_info.email + '</a><br/>';
  str += (is_valid_data(user_info.blog_link) ? '<a href="' + user_info.blog_link + '">My blog</a> | ' : '') + (is_valid_data(user_info.linkedin_link) ? '<a href="' + user_info.linkedin_link + '">LinkedIn profile</a>' : '') + (is_valid_data(user_info.follow_research_link) ? ' | <a href="' + user_info.follow_research_link + '">Follow my latest research</a><br/>' : '');
  str += '<br/>';
  str += '<strong>Forrester Research, Inc.</strong><br/>';
  str += '60 Acorn Park Drive, Cambridge, MA 02140 United States<br/>';
  str += '<a href="http://www.forrester.com/">Forrester.com</a> | <a href="http://blogs.forrester.com/">Blogs</a> | <a href="http://forr.com/what-it-means">Podcasts</a> | <a href="http://twitter.com/forrester">Twitter</a> | <a href="http://linkedin.com/company/forrester-research">LinkedIn</a> | <a href="http://www.youtube.com/user/forresterresearch">YouTube</a><p>';
  str += (is_valid_data(quote) ? '<p><span style="font-size:7.0pt;font-family:Arial,sans-serif">' + quote + '</span></p>' : '');

  return str;
}

function get_template_B_base_str(user_info)
{
  let str = "";
  if (is_valid_data(user_info.greeting)) {
    str += user_info.greeting + "<br/>";
  }

  str += '–' + user_info.name;

  return str;
}

function get_greeting(user_info)
{
  let str = "";
  if (is_valid_data(user_info.greeting)) {
    str += user_info.greeting + "<br/>";
  }
  
  return str;
}

function get_template_A_signature(user_info, quote)
{
  let str = get_greeting(user_info);
  str += get_template_A_base_str(user_info, quote);
  
  return str;
}

function get_template_B_signature(user_info, quote)
{
  let str = get_greeting(user_info);
  str += get_template_B_base_str(user_info, quote);
  
  return str;
}

function get_random_quote(user_info) {
  let group_1_quote = get_random_group_1_quote();
  let group_2_quote = get_random_group_2_quote();
  
  return (Math.random() < .5 && is_valid_data(group_1_quote) ? group_1_quote : is_valid_data(group_2_quote) ? group_2_quote : '').replace('"', '&quot;').replace('\'', '&apos;');
}

function get_random_group_1_quote(user_info) {
console.log('get_random_group_1_quote');
console.log(user_info);
console.log(user_info.group_1_quotes);
  var group1Quotes = user_info.group_1_quotes.split('\n');
console.log(group1Quotes);
  return group1Quotes[Math.floor(Math.random() * group2Quotes.length)];
}

function get_random_group_2_quote(user_info) {
  var group2Quotes = user_info.group_2_quotes.split('\n');
  return group2Quotes[Math.floor(Math.random() * group2Quotes.length)];
}
