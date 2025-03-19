
/**
 * name : gfn_isNull
 * comment : null 확인
 */
function gfn_isNull(value) {
    if (value === null || typeof value === "undefined" || value === "" || value === "undefined" || value === undefined) {
        return true;
    }

    return false;
}

/**
 * name : gfn_nvlChange
 * comment : null 값 변경 
 */
function gfn_nvlChange(chk_val, change_val) {
    let value = "";

    if (gfn_isNull(chk_val)) {
        if (!gfn_isNull(change_val)) {
            value = change_val;
        }
    } else {
        value = chk_val;
    }

    return value;
}

/**
 * name : gfn_changeFile
 * comment : 파일 업로드 공통
 *          mode : [I : 이미지 , M : 다중 업로드, O : 한개만 업로드시]
 *          obj : input type가 file인 값 ex) 보통은 this로 값 넣어주면됨
 *          id : 파일업로드의 값이 들어가는 위치 ex) #file_list / #preview_
 *          strExt : 확장자 ex) jpg|gif|jpeg|png|pdf|zip
 *          limitSize : 파일의 사이즈를 확인
 *          options : 다중 파일업로드의 데이터 보관
 *              fileMap : mode가 M인경우 다중파일일 경우 값 저장을 위하여
 *              formData_del : mode가 M인경우 다중파일 삭제 기능을 사용하기위해서
 *              del_count :  mode가 M인경우 삭제 pk값보관
 *              file_list_row : mode가 M인경우 다중 업로드의 row 및 줄을 만들기위해 사용 ex) file-row
 *              row_val : mode가 M인경우 다중 업로드의 파일 올릴 max값을 지정해줌
 *              ues : 관리자 / 메인페이지 확인 'A' : 관리자 / 'M' : 메인페이지 및 커스텀
 */
function gfn_changeFile(options) {
    let {
          mode // [I : 이미지 , M : 다중 업로드, O : 한개만 업로드시]
        , obj // input type가 file인 값 ex) 보통은 this로 값 넣어주면됨
        , id // 파일업로드의 값이 들어가는 위치 ex) #file_list / #preview_
        , strExt // 확장자 ex) jpg|gif|jpeg|png|pdf|zip
        , limitSize // 파일의 사이즈를 확인
        , fileMap // mode가 M인경우 다중파일일 경우 값 저장을 위하여
        , formData_del // mode가 M인경우 다중파일 삭제 기능을 사용하기위해서
        , del_count // mode가 M인경우 삭제 pk값보관
        , file_list_row // mode가 M인경우 다중파일의 pk값을 보관
        , row_val //mode가 M인경우  다중파일의  max값을 지정해줌
        , ues // 관리자 / 메인페이지 확인 'A' : 관리자 / 'M' : 메인페이지 및 커스텀
    } = options;

    if (gfn_isNull(strExt)) { // 기본셋팅 값 추가
        strExt = "jpg|jpeg|png|gif|pdf|doc|docx|ppt|pptx|xls|xlsx|zip";
    }

    let allowed_ext = strExt.split("|");
    let str_allowed_ext = allowed_ext.join(", ");
    let max_size = limitSize * 1024 * 1024;
    let arrImgFiles = obj.files;
    let file_row = 0;
    let img_size = arrImgFiles.length;
    let map_size = fileMap.size;

    if (gfn_isNull(file_list_row)) {
        file_list_row = '.file-row';
    }
    
    let file_list_row_name = file_list_row.substring(1);

    if (mode == "M") {
        //file_row = parseInt($(file_list_row).length);
        file_row = $('[id^="' + file_list_row_name + '"]').length;

        if (!gfn_isNull(row_val)) {
            if ((map_size + img_size) > row_val || file_row >= row_val || (file_row + img_size) > row_val) {
                alert("첨부파일은 " + row_val + "개까지 업로드 가능합니다.");
                obj.value = "";
                return 0;
            }
        }
    }

    $.each(arrImgFiles, function (index, file) {
        let file_name = file.name;
        let file_size = file.size;
        let ext = file.name.split(".").pop().toLowerCase();
        let idx = 0;
        let html = "";

        if (allowed_ext.length > 0) {
            if ($.inArray(ext, allowed_ext) == -1) {
                alert("첨부 파일은 " + str_allowed_ext + " 확장자만 가능합니다.");
                obj.focus();
                obj.value = "";

                if (mode == "I") {
                    $(id).prop("src", "");
                }

                return 0;
            }
        }

        if (!check_special_str(file_name)) {
            alert("파일명에 특수문자가 포함되어 있습니다.");
            obj.focus();
            obj.value = "";

            return 0;
        }

        if (file_size > max_size) {
            alert("파일용량은 " + limitSize + "MB 까지 가능합니다.");
            obj.focus();
            obj.value = "";

            if (mode == "I") {
                $(id).prop("src", "");
            }

            return 0;
        }

        if (mode == "M") {
            if (file_row > 0) {
                //idx = parseInt($(file_list_row).last().data("idx")) + 1;

                let maxIdx = -1;

                $('*[id^="' + file_list_row_name + '"]').each(function() {
                    let currentIdx = $(this).data("idx");
                    if (currentIdx > maxIdx) {
                        maxIdx = currentIdx;
                    }
                });
            
                if (maxIdx >= 0) {
                    idx = maxIdx + 1;
                } else {
                    idx = index; // 혹은 적절한 기본값
                }
            } else {
                idx = index;
            }
            
            if (ues == "A") {
                html += "<div class=\"input-group file-row\" style = \"padding : 5px 0px; column-gap: 10px;\" id=\"" + file_list_row_name + idx + "\" data-idx=\"" + idx + "\"> \n";
                html += "   <img style='height:16px;' src='/adm/img/paper-clip.svg' alt='paper clip'> \n";
                html += "   <p>" + file_name + "</p>\n";
                html += "   <a href=\"javascript:void(0);\" class=\"text-decoration-none font-weight-bold text-dark\" onclick=\"javascript:upFileDel(" + idx + ",'" + file_list_row_name + "');\">\n";
                html += "       x\n";
                html += "   </a> \n";
                html += "</div>\n";
            } else {

            }

            $(id).append(html);

            fileMap.set(idx, file);
        } else if (mode == "O") {
            $(id).html("");

            if (ues == "A") {
                html += "<div style = 'margin: 5px 0 0 0;'>\n";
                html += "   <img style='height:16px;' src='/adm/img/paper-clip.svg' alt='paper clip'> \n";
                html += "   <p style='display:inline-block'>" + file_name + "</p> \n";
                html += "</div> \n";
            } else {
                
            }
    
            $(id).html(html);
        } else if (mode == "I") {
			var reader = new FileReader();
			
            reader.onload = function (e) {
                $(id).attr('src', e.target.result);
            }
            
            reader.readAsDataURL(file);
            //$(id).attr("src", URL.createObjectURL(file));
        }
    });

    return {fileMap: fileMap, formData_del: formData_del, del_count: del_count};
}

/**
 * name : gfn_upFileDel
 * comment : 파일 업로드 삭제
 *          idx : 삭제되는 값의 PK값
 *          options : 다중 파일업로드의 데이터 보관
 *              fileMap : mode가 M인경우 다중파일일 경우 값 저장을 위하여
 *              formData_del : mode가 M인경우 다중파일 삭제 기능을 사용하기위해서
 *              del_count :  mode가 M인경우 삭제 pk값보관
 */
function gfn_upFileDel(idx, options) {
    if (confirm("해당 첨부파일을 삭제하시겠습니까?")) {
        let {
            fileMap // mode가 M인경우 다중파일일 경우 값 저장을 위하여
            , formData_del // mode가 M인경우 다중파일 삭제 기능을 사용하기위해서
            , del_count // mode가 M인경우 삭제 pk값보관
            , file_list_row // mode가 M인경우 다중파일의 pk값을 보관
        } = options

        let chk = 'N';

        fileMap.delete(idx);
        $(file_list_row + idx).remove();
        $(".custom-file-label").eq(1).text("업로드된 파일 " + fileMap.size + "개");

        for (let i = 0; i < formData_del.length; i++) {
            if (idx == formData_del[i]) {
                chk = 'Y';
                break;
            }
        }

        if (chk == 'N') {
            formData_del[del_count++] = idx;
        }

        return {fileMap: fileMap, formData_del: formData_del, del_count: del_count};
    }
}

/**
 * name : validatePassword
 * comment : 비밀번호에 영문, 숫자, 특수문자 중 requiredCriteria 이상의 조합을 포함하여 requiredLength 자 이상인지 확인
 *          password : 확인할 값
 *          requiredCriteria : 3가의 이상의 조합을 포함 영문, 숫자, 특수문자
 *          requiredLength : 최소 길이값
 */
function validatePassword(password, requiredCriteria, requiredLength) {
    // 비밀번호에 영문, 숫자, 특수문자 중 requiredCriteria 이상의 조합을 포함하여 requiredLength 자 이상인지 확인
    var hasAlpha = /[a-zA-Z]/.test(password);
    var hasNumber = /\d/.test(password);
    var hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    // 조건에 맞는 조합의 개수를 계산
    var matchingCriteria = (hasAlpha ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

    return matchingCriteria >= requiredCriteria && password.length >= requiredLength;
}


//특수문자 체크
function check_special_str(str) {
    var pattern =  /[\{\}\/?,;:|*~`!^\+<>@\#$%&\\\=\'\"]/gi;

    if (pattern.test(str)) {
        return false;
    }

    return true;
}

// 이니시스 정보 작성
function INISTVALUEINFO(INFO_VALUE) {
    $('input[name="buyername"]').val(INFO_VALUE['buyername']); //주문자명
    $('input[name="buyertel"]').val(INFO_VALUE['buyertel']); // 주문자 연락처
    $('input[name="buyeremail"]').val(INFO_VALUE['buyeremail']); // 주문자 이메일
}

// 이니시스 모바일용
function INISTVALUEINFO_MO(INFO_VALUE) {
    $('input[name="P_UNAME"]').val(INFO_VALUE['buyername']); //주문자명
    $('input[name="P_MOBILE"]').val(INFO_VALUE['buyertel']); // 주문자 연락처
    $('input[name="P_EMAIL"]').val(INFO_VALUE['buyeremail']); // 주문자 이메일
}

// 숫자에 콤마 추가하는 함수
function formatNumber(input) {
    let value = input.value.replace(/[^\d]/g, ""); // 숫자 이외의 문자 제거
    let formattedValue = Number(value).toLocaleString(); // 숫자에 콤마 추가
    input.value = formattedValue
}

// 모달팝업
function gfn_alert(type, content, button1, button2, callback1, callback2) {
    let id = "";
    let e_url = "";
    let e_content = "";
    let e_button1 = "";
    let e_button2 = "";
    let e_callback1 = "";
    let e_callback2 = "";

    if (gfn_isNull(type)) {
        return;
    }

    if (!gfn_isNull(content)) {
        e_content = content;
    }

    if (!gfn_isNull(button1)) {
        e_button1 = button1;
    } else {
        e_button1 = "확인";
    }

    if (!gfn_isNull(button2)) {
        e_button2 = button2;
    } else {
        e_button2 = "취소";
    }

    if (!gfn_isNull(callback1)) {
        e_callback1 = callback1;
    } else {
        e_callback1 = 'cancel';
    }

    if (!gfn_isNull(callback2)) {
        e_callback2 = callback2;
    } else {
        e_callback2 = 'cancel';
    }

    if (type == "alert") {
        id = "alert_popup";
        e_url = "/include/alert_popup.php";

    } else if (type == "confirm") {
        id = "confirm_popup";
        e_url = "/include/confirm_popup.php";
    } else {
        return;
    }

    $.ajax({
        url: e_url, // HTML 파일 경로를 지정합니다.
        type: 'GET',
        success: function(data) {
            data = data.replace('${content}', e_content)
                       .replace('${button1}', e_button1)
                       .replace('${button2}', e_button2)
                       .replace('${callback1}', e_callback1)
                       .replace('${callback2}', e_callback2)
                       .replace(/\${id}/g, id);

            let parser = new DOMParser();
            let doc = parser.parseFromString(data, 'text/html');
            let popupDiv = doc.getElementById(id);

            document.body.appendChild(popupDiv);

            $(".popup_bg").stop().fadeIn();
            $("#" + id).stop().fadeIn();  
            $('html, body').addClass("noScroll");
        },
        error: function(xhr, status, error) {
            // 오류 처리
            console.error("팝업 파일을 불러오는 중 오류가 발생했습니다.");
        }
    });
}


// 팝업 닫기
function gfn_cust_popClose (callback, call_id) {
    $(".popup_bg").stop().fadeOut();
    $(".popup").stop().fadeOut();
    $('html, body').removeClass("noScroll");

    if (!gfn_isNull(callback)) {
        if (callback != 'cancel') {
            window[callback]();
        }
    }

    let popupDiv = document.getElementById(call_id);
    popupDiv.parentNode.removeChild(popupDiv);
}

// 이메일 검증
function gfn_isValidEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
}

// 휴대폰 번호 유효성 검사
function gfn_isValidPhoneNumber(phoneNumber) {
    // 휴대폰 번호는 다양한 형식이 있을 수 있으므로 정확한 패턴을 지정하세요.
    // 예: 010-1234-5678 또는 01012345678 등
    const phonePattern = /^(01[0-9]{1})?[-]?[0-9]{4}[-]?[0-9]{4}$/;
    return phonePattern.test(phoneNumber);
}

// 폼 핸드폰
gfn_autoHyphen = (target) => {
    target.value = target.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
}

/**
 * name : gfn_Custom_ready
 * comment : 커스텀 관리자 상세페이지 초기 시작 기본값
 */
function gfn_Custom_ready(callback) {
    $(document).ready(function() {
        //정렬 버튼(+/-)
        $(".touchspin1").TouchSpin({
            buttondown_class: 'btn btn-white',
            buttonup_class: 'btn btn-white'
        });

        //라디오 버튼
        $('.i-checks').iCheck({
            checkboxClass: 'icheckbox_square-green',
            radioClass: 'iradio_square-green',
        });

        // 라디오 버튼 클릭 이벤트 처리
        $('input[type="radio"]').on('ifChecked', function(event) {
            // 모든 라디오 버튼의 checked 클래스를 제거
            $('input[type="radio"]').parent().parent().removeClass('checked');
        });

        if (!gfn_isNull(callback)) {
            window[callback]();
        }
    });
}


/**
 * name : gfn_checkFrm
 * comment : 관리자 검색버튼
 */
function gfn_checkFrm() {
    $("#frm").submit();
}


/**
 * name : gfn_findClosestMarker
 * comment : GPS 기반 가장 가까운 매장/상점등 찾기 [버블정렬 이용함]
 *          list : 토탈적으로 경도 위도를 가지고있는 json값 {Y_COORDINATE : 0000, X_COORDINATE}, {Y_COORDINATE : 0000, X_COORDINATE}
 *          lat : 위치기반 gps 위도
 *          lon : 위치기반 gps 경도
 */
function gfn_findClosestMarker(list, lat, lon) {
    var closestMarker = null;
    var closestDistance = Infinity;

    list.forEach(function(casemarker) {
        var distance = gfn_getDistance(lat, lon, parseFloat(casemarker.Y_COORDINATE), parseFloat(casemarker.X_COORDINATE));
        if (distance < closestDistance) {
            closestDistance = distance;
            closestMarker = casemarker;
        }
    });

    return closestMarker;
}

/**
 * name : gfn_getDistance
 * comment : 위치기반 gps (경/위도 값에서 토탈 list의 경/위도의 값을 뽑아와 두개의 값을 계산 )
 *          lat1 : 위치기반 gps 위도
 *          lon1 : 위치기반 gps 경도
 *          lat2 : 토탈 값 중 하나의 위도
 *          lon2 : 토탈 값 중 하나의 경도
 */
function gfn_getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // 지구의 반지름(km)
    var dLat = gfn_deg2rad(lat2 - lat1); 
    var dLon = gfn_deg2rad(lon2 - lon1); 
    var a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(gfn_deg2rad(lat1)) * Math.cos(gfn_deg2rad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    var d = R * c; // 거리(km)
    return d;
}

/**
 * name : gfn_deg2rad
 * comment : 두 지점(위도, 경도)을 매개변수로 받아, 그 사이의 거리를 킬로미터 단위로 반환
 *           / 도(degree) 단위를 라디안(radian) 단위로 변환하는 데 사용
 *          deg : 단위 변화할 값
 */
function gfn_deg2rad(deg) {
    return deg * (Math.PI / 180)
}

/**
 * name : gfn_getLocation
 * comment : Geolocation API의 위치기반를 사용 여부
 */
function gfn_getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(ufn_showPosition, gfn_showError);
    } else {
        console.log("이 브라우저에서는 Geolocation API를 지원하지 않습니다.");
        alert("이 브라우저에서는 Geolocation API를 지원하지 않습니다.");
    }
}

/**
 * name : gfn_showError
 * comment : Geolocation API의 에러 값 모음 리스트
 */
function gfn_showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("사용자가 위치 정보 접근 요청을 거부했습니다.");
            alert("위치 정보 사용이 차단되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("사용 가능한 위치 정보가 없습니다.");
            alert("위치 정보를 사용할 수 없습니다. 장치의 위치 서비스가 활성화되어 있는지 확인해주세요.");
            break;
        case error.TIMEOUT:
            console.log("위치 정보를 가져오는 요청이 시간 초과됐습니다.");
            alert("위치 정보 요청 시간이 초과되었습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("알 수 없는 오류가 발생했습니다.");
            alert("알 수 없는 오류가 발생했습니다. 페이지를 새로 고침하거나 관리자에게 문의해주세요.");
            break;
        default:
            console.log("알 수 없는 오류가 발생했습니다.");
            alert("알 수 없는 오류가 발생했습니다. 페이지를 새로 고침 해주세요.");
            break;
    }
}

/* 해당 부분은 사용시 클리프 list 값 설정 카카오맵 기준 예시 
    function ufn_showPosition(position) {     
        var lat = position.coords.latitude; // 위도
        var lon = position.coords.longitude; // 경도
        var accuracy = position.coords.accuracy; // 위치 정확도

        console.log("Latitude: " + lat + ", Longitude: " + lon + ", Accuracy: " + accuracy + " meters.");

        var moveLatLon = new kakao.maps.LatLng(lat, lon);
        var closestMarker = gfn_findClosestMarker(list, lat, lon);
        
        if (closestMarker) {
            moveLatLon = new kakao.maps.LatLng(parseFloat(closestMarker.Y_COORDINATE), parseFloat(closestMarker.X_COORDINATE))
        }

        map.setCenter(moveLatLon);
    }
*/

/**
 * name : gfn_setupSelectBox
 * comment : 콤보박스 연관 설정 [필터링 기능]
 *          typeSelectBoxId : 첫번째 콤보박스 ID 값
 *          productSelectBoxId : 두번쨰 콤보박스 ID 값
 *          countryValue : 조건값 [첫번째에 해당하는 콤보박스의 값을 필터링후 두번쨰 콤보박스에서 찾을값]
 *          ex): gfn_setupSelectBox('selectBox ID', 'selectBox2 ID', COUNTRY_value);
 */
function gfn_setupSelectBox(typeSelectBoxId, productSelectBoxId, countryValue) {
    const selectBox = document.getElementById(typeSelectBoxId); // 첫번째 콤보박스
    const selectBox2 = document.getElementById(productSelectBoxId); // 두번째 콤보박스
    const options = selectBox2.options;

    selectBox.addEventListener('change', () => {
        const selectedValue = selectBox.value;

        Array.from(options).forEach(option => option.hidden = true); // 모든 option 요소 숨기기

        if (selectedValue === '') { // 전체 옵션 선택한 경우
            selectBox2.selectedIndex = -1; // 선택된 option 요소 초기화
            Array.from(options).forEach(option => option.hidden = true); // 모든 option 요소 숨기기
            selectBox2.options[0].hidden = false;
            selectBox2.selectedIndex = 0;
        } else { // 일반적인 경우
            const filteredOptions = Array.from(options).filter(option => {
                const dataCode = option.getAttribute('data-code1');
                return dataCode === selectedValue;
            });

            filteredOptions.forEach(option => option.hidden = false);
            selectBox2.options[0].hidden = false;

            if (countryValue != '') {
                for (let i = 0; i < selectBox2.options.length; i++) {
                    if (selectBox2.options[i].value === countryValue) {
                        selectBox2.selectedIndex = i;
                        countryValue = ''; // 값을 초기화
                        break;
                    }
                }
            } else {
                selectBox2.selectedIndex = 0;
            }
        }
    });

    selectBox.dispatchEvent(new Event('change')); // change 이벤트 강제 발생
}

/**
 * name : gfn_getFormattedDate
 * comment : 오늘 날짜의 값을 가져옴
 */
function gfn_getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더해야 함
    const day = date.getDate();

    // 달과 일이 10보다 작으면 앞에 0을 붙여줌
    const formattedMonth = month < 10 ? `0${month}` : month;
    const formattedDay = day < 10 ? `0${day}` : day;

    return `${year}-${formattedMonth}-${formattedDay}`;
}

/**
 * name : gfn_setupDatePicker
 * comment : daterangepicker 설정 [날짜 기간 범위 설정 input 기능] 
 *          InfodateBoxId : 날짜 기간을 사용할 input의 ID
 *          InfostartDate : 시작일
 *          InfoendDate : 종료일 
 */
function gfn_setupDatePicker(InfodateBoxId, InfostartDate, InfoendDate) {
    if (gfn_isNull(InfostartDate)) {
        InfostartDate = gfn_getFormattedDate();
    }

    if (gfn_isNull(InfoendDate)) {
        InfoendDate = gfn_getFormattedDate();
    }

    $("#" + InfodateBoxId).daterangepicker({
        startDate: InfostartDate,
        endDate: InfoendDate,
        showDropdowns: true,
        timePicker: false,
        timePicker24Hour: false,
        timePickerSeconds: false,
        singleDatePicker: false,
        locale: {
            format: 'YYYY-MM-DD',
            separator: ' ~ ',
            applyLabel: "적용",
            cancelLabel: "닫기",
            daysOfWeek: ["일", "월", "화", "수", "목", "금", "토"],
            monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
        }
    });
}

const gfn_handleAjaxPOST = async (url, method = "P", list = {}, type = "urlencoded", ...callbacks) => {
    try {
        $('.gfn-loading-bar').css('display', 'flex'); // 로딩바 표시

        let options = {
            method: method === "G" ? "GET" : "POST"
        };

        // GET 방식이면 URL에 파라미터 추가
        if (method === "G") {
            url += "?" + new URLSearchParams(list).toString();
        } else {
            if (list instanceof FormData || type === "formdata") { // FormData 사용
                options.body = list;
            } else if (type === "json") { // JSON 방식으로 보내기
                options.headers = { "Content-Type": "application/json" };
                options.body = JSON.stringify(list);
            } else { // 기본 1차원 객체 (application/x-www-form-urlencoded)
                options.headers = { "Content-Type": "application/x-www-form-urlencoded" };
                options.body = new URLSearchParams(list);
            }
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (callbacks.length > 0) {
            callbacks.forEach(callback => callback(data));
        }

        if (data.code != 200) {
            alert(data.msg);
        }

        return data;
    } catch (error) {
        console.error("요청 실패:", error);
        throw error;
    } finally {
        $('.gfn-loading-bar').css('display', 'none'); // 로딩바 숨김
    }
};

