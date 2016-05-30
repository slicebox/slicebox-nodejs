
var currentStudyDiv;
var currentSeriesDiv;

function getStudies(patientId) {
    ajax.get('/studies', { patientid: patientId }, function(studiesString) {
        var studies = JSON.parse(studiesString);
        if (currentStudyDiv) {
            currentStudyDiv.parentNode.removeChild(currentStudyDiv);
        }
        var liTag = document.getElementById("patient-" + patientId);
        currentStudyDiv = document.createElement("ul");
        var studiesHtml = studies.map(function(study) {
            return "<li id='study-" + study.id + "' onclick='event.stopPropagation();getSeries(" + study.id + ")'>" + study.studyDate.value + "</li>"
        }).join("\n");
        currentStudyDiv.innerHTML = studiesHtml;
        liTag.appendChild(currentStudyDiv);
    });
}

function getSeries(studyId) {
    ajax.get('/series', { studyid: studyId }, function(seriesString) {
        var series = JSON.parse(seriesString);
        if (currentSeriesDiv) {
            currentSeriesDiv.parentNode.removeChild(currentSeriesDiv);
        }
        var liTag = document.getElementById("study-" + studyId);
        currentSeriesDiv = document.createElement("ul");
        var seriesHtml = series.map(function(s) {
            return "<li onclick=\"window.location.href=\'/images?seriesid=" + s.id + "\'\">" + s.modality.value + "</li>"
        }).join("\n");
        currentSeriesDiv.innerHTML = seriesHtml;
        liTag.appendChild(currentSeriesDiv);
    });
}
