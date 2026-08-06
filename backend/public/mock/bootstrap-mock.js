(function () {
  if (!window.location.pathname.startsWith('/glist')) return;

  try {
    var request = new XMLHttpRequest();
    request.open('GET', '/mock/course-assignments.json', false);
    request.send(null);

    if (request.status >= 200 && request.status < 300) {
      var courses = JSON.parse(request.responseText);
      localStorage.setItem('crow_data', JSON.stringify(courses));
      localStorage.setItem('univ_name', 'Guamegi 데모 대학교');
      localStorage.setItem('r_depart', '소프트웨어학과');
      localStorage.setItem('r_time', new Date().toISOString().slice(0, 19).replace('T', ' '));
    }
  } catch (error) {
    console.error('목업 과제 데이터를 불러오지 못했습니다.', error);
  }
})();
