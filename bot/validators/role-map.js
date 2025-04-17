const roleMap = {
    'field worker': 'Field Worker',
    'jk': 'JK',
    'adj': 'ADJ',
    'ritwick': 'Ritwick',
    'block coordinator': 'Block Coordinator',
    'district admin': 'District Admin'
  };
  
  function isValidRole(input) {
    return roleMap.hasOwnProperty(input.trim().toLowerCase());
  }
  
  function getFormattedRole(input) {
    return roleMap[input.trim().toLowerCase()] || input.trim();
  }
  
  module.exports = { isValidRole, getFormattedRole };
  