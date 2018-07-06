import * as Webcam from 'webcamjs';

Webcam.attach( '#my_camera' );

function take_snapshot() {
  Webcam.snap( function(data_uri) {
    document.getElementById('my_result').innerHTML = '<img src="'+data_uri+'"/>';
  } );
}

window.take_snapshot = take_snapshot;
