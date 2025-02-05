//お気に入り登録やブースト等、フォローやブロック等
//お気に入り登録
function fav(id, acct_id, remote) {
    if ($(`.cvo[unique-id=${id}]`).hasClass('faved')) {
        var flag = 'unfavourite'
    } else {
        var flag = 'favourite'
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/statuses/' + id + '/' + flag
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send()
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, json)
            }
            if (json.reblog) {
                json = json.reblog
            }
            if (remote != 'remote') {
                //APIのふぁぼカウントがおかしい
                if ($('[unique-id=' + id + '] .fav_ct').text() == json.favourites_count) {
                    if (flag == 'unfavourite') {
                        var fav = json.favourites_count - 1
                        if (fav * 1 < 0) {
                            fav = 0
                        }
                    } else {
                        var fav = json.favourites_count
                            //var fav = json.favourites_count;
                    }
                } else {
                    var fav = json.favourites_count
                }
                $('[unique-id=' + id + '] .fav_ct').text(fav)
                $('[unique-id=' + id + '] .rt_ct').text(json.reblogs_count)
                if ($('[unique-id=' + id + ']').hasClass('faved')) {
                    $('[unique-id=' + id + ']').removeClass('faved')
                    $('.fav_' + id).removeClass('yellow-text')
                } else {
                    $('[unique-id=' + id + ']').addClass('faved')
                    $('.fav_' + id).addClass('yellow-text')
                }
            } else {
                M.toast({ html: lang.lang_status_favWarn, displayLength: 1000 })
            }
        }
    }
}

//ブースト
function rt(id, acct_id, remote, vis) {
    if ($(`.cvo[toot-id=${id}]`).hasClass('rted')) {
        var flag = 'unreblog'
    } else {
        var flag = 'reblog'
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/statuses/' + id + '/' + flag
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    if (vis) {
        httpreq.send(JSON.stringify({ visibility: vis }))
    } else {
        httpreq.send()
    }
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, json)
            }
            if (json.reblog) {
                json = json.reblog
            }
            console.log(['Success: boost', json])
            $('[toot-id=' + id + '] .fav_ct').text(json.favourites_count)
            if (!json.reblog) {
                if (flag == 'unreblog') {
                    var rt = json.reblogs_count - 1
                    if (rt * 1 < 0) {
                        rt = 0
                    }
                } else {
                    var rt = json.reblogs_count
                }
                $('[toot-id=' + id + '] .rt_ct').text(rt)
            } else {
                $('[toot-id=' + id + '] .rt_ct').text(json.reblogs_count)
            }

            if ($('[toot-id=' + id + ']').hasClass('rted')) {
                $('[toot-id=' + id + ']').removeClass('rted')
                $('.rt_' + id).removeClass('light-blue-text')
            } else {
                $('[toot-id=' + id + ']').addClass('rted')
                $('.rt_' + id).addClass('light-blue-text')
            }
        }
    }
}

function boostWith(vis) {
    var id = $('#tootmodal').attr('data-id')
    var acct_id = $('#tootmodal').attr('data-acct')
    rt(id, acct_id, false, vis)
}
//ブックマーク
function bkm(id, acct_id, tlid) {
    if ($(`.cvo[unique-id=${id}]`).hasClass('bkmed')) {
        var flag = 'unbookmark'
    } else {
        var flag = 'bookmark'
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/statuses/' + id + '/' + flag
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send()
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, json)
            }
            if (json.reblog) {
                json = json.reblog
            }
            var fav = json.favourites_count
            $('[toot-id=' + id + '] .fav_ct').text(fav)
            $('[toot-id=' + id + '] .rt_ct').text(json.reblogs_count)
            if (flag == 'unbookmark') {
                $('.bkmStr_' + id).text(lang.lang_parse_bookmark)
                $('.bkm_' + id).removeClass('red-text')
                $('[toot-id=' + id + ']').removeClass('bkmed')
            } else {
                $('.bkmStr_' + id).text(lang.lang_parse_unbookmark)
                $('.bkm_' + id).addClass('red-text')
                $('[toot-id=' + id + ']').addClass('bkmed')
            }
            var tlidTar = $(`.bookmark-timeline[data-acct=${acct_id}]`).attr('tlid')
            columnReload(tlidTar, 'bookmark')
        }
    }
}

//フォロー
async function follow(acct_id, resolve) {
    if ($('#his-data').hasClass('locked')) {
        locked = true
    } else {
        locked = false
    }
    if (!acct_id && acct_id != 'selector') {
        var acct_id = $('#his-data').attr('use-acct')
    } else if (acct_id == 'selector') {
        var acct_id = $('#user-acct-sel').val()
    }
    if (!resolve && $('#his-data').hasClass('following')) {
        var flag = 'unfollow'
        var flagm = 'delete'
    } else {
        var flag = 'follow'
        var flagm = 'create'
    }

    var id = $('#his-data').attr('user-id')
    if (resolve == 'selector') {
        var fullacct = $('#his-acct').attr('fullname')
        var data = await acctResolve(acct_id, fullacct)
        var { id } = data
        console.log(id)
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/accounts/' + id + '/' + flag
    if (localStorage.getItem('mode_' + domain) == 'misskey') {
        var start = 'https://' + domain + '/api/following/' + flagm
        var ent = { i: at, userId: id }
    } else if (flag == 'follow') {
        var ent = {}
    }
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send(JSON.stringify(ent))
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, json)
            }
            console.log(['Success: folllow', json])
            if ($('#his-data').hasClass('following')) {
                $('#his-data').removeClass('following')
                $('#his-follow-btn-text').text(lang.lang_status_follow)
            } else {
                $('#his-data').addClass('following')
                if (locked) {
                    $('#his-follow-btn-text').text(lang.lang_status_requesting)
                } else {
                    $('#his-follow-btn-text').text(lang.lang_status_unfollow)
                }
            }
        }
    }
}
async function acctResolve(acct_id, user) {
    console.log('Get user data of ' + user)
    const domain = localStorage.getItem('domain_' + acct_id)
    if (localStorage.getItem('mode_' + domain) == 'misskey') {
        return false
    }
    const at = localStorage.getItem('acct_' + acct_id + '_at')
    const options = {
        method: 'GET',
        headers: {
            'content-type': 'application/json',
            Authorization: 'Bearer ' + at,
        },
    }
    try {
        const start = `https://${domain}/api/v1/accounts/lookup?acct=${user}`
        const promise = fetch(start, options)

        const idJson = await promise.json()
        if (idJson) {
            return idJson
        } else {
            return await acctResolveLegacy(domain, user, options)
        }
    } catch {
        return await acctResolveLegacy(domain, user, options)
    }
}
async function acctResolveLegacy(domain, user, options) {
    console.log(`Get user data of ${user} with legacy method`)
    try {
        const start = 'https://' + domain + '/api/v2/search?resolve=true&q=' + user
        const promise = fetch(start, options)
        const idJson = await promise.json()
        if (idJson.accounts[0]) {
            return idJson.accounts[0]
        } else {
            M.toast({ html: lang.lang_fatalerroroccured, displayLength: 2000 })
        }
    } catch {
        console.log('Error occured on searching and fetching with resolve')
    }
}
//ブロック
function block(acct_id) {
    if ($('#his-data').hasClass('blocking')) {
        var flag = 'unblock'
        var txt = lang.lang_status_unmute
    } else {
        var flag = 'block'
        var txt = lang.lang_status_block
    }
    Swal.fire({
        title: txt,
        text: '',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: lang.lang_yesno,
        cancelButtonText: lang.lang_no,
    }).then((result) => {
        if (result.value) {
            if (!acct_id) {
                var acct_id = $('#his-data').attr('use-acct')
            }
            var id = $('#his-data').attr('user-id')
            var domain = localStorage.getItem('domain_' + acct_id)
            var at = localStorage.getItem('acct_' + acct_id + '_at')
            var start = 'https://' + domain + '/api/v1/accounts/' + id + '/' + flag
            var httpreq = new XMLHttpRequest()
            httpreq.open('POST', start, true)
            httpreq.setRequestHeader('Content-Type', 'application/json')
            httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
            httpreq.responseType = 'json'
            httpreq.send()
            httpreq.onreadystatechange = function() {
                if (httpreq.readyState === 4) {
                    if (this.status !== 200) {
                        setLog(start, this.status, this.response)
                    }
                    if ($('#his-data').hasClass('blocking')) {
                        $('#his-data').removeClass('blocking')
                        $('#his-block-btn-text').text(lang.lang_status_block)
                    } else {
                        $('#his-data').addClass('blocking')
                        $('#his-block-btn-text').text(lang.lang_status_unblock)
                    }
                }
            }
        }
    })
}

//ミュート
function muteDo(acct_id) {
    if ($('#his-data').hasClass('muting')) {
        var flag = 'unmute'
        var flagm = 'delete'
        var txt = lang.lang_status_unmute
    } else {
        var flag = 'mute'
        var flagm = 'create'
        var txt = lang.lang_status_mute
    }
    Swal.fire({
        title: txt,
        text: '',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: lang.lang_yesno,
        cancelButtonText: lang.lang_no,
    }).then((result) => {
        if (result.value) {
            if (!acct_id) {
                var acct_id = $('#his-data').attr('use-acct')
            }
            var id = $('#his-data').attr('user-id')
            var domain = localStorage.getItem('domain_' + acct_id)
            var at = localStorage.getItem('acct_' + acct_id + '_at')
            const days = parseInt($('#days_mute').val(), 10)
            const hours = parseInt($('#hours_mute').val(), 10)
            const mins = parseInt($('#mins_mute').val(), 10)
            const notf = $('#notf_mute:checked').val() === '1'
            let duration = days * 24 * 60 * 60 + hours * 60 + mins
            if (localStorage.getItem('mode_' + domain) == 'misskey') {
                var start = 'https://' + domain + '/api/mute/' + flagm
                var ent = { i: at, userId: id }
                var rq = JSON.stringify(ent)
            } else {
                var start = 'https://' + domain + '/api/v1/accounts/' + id + '/' + flag
                const q = {
                    notifications: notf
                }
                if (duration > 0) q.duration = duration * 60
                if (days < 0 || hours < 0 || mins < 0) return Swal.fire('Invalid number')
                var rq = JSON.stringify(q)
            }
            var httpreq = new XMLHttpRequest()
            httpreq.open('POST', start, true)
            httpreq.setRequestHeader('Content-Type', 'application/json')
            httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
            httpreq.responseType = 'json'
            httpreq.send(rq)
            httpreq.onreadystatechange = function() {
                if (httpreq.readyState === 4) {
                    if (this.status !== 200) {
                        setLog(start, this.status, this.response)
                    }
                    if ($('#his-data').hasClass('muting')) {
                        $('#his-data').removeClass('muting')
                        $('#his-mute-btn-text').text(lang.lang_status_mute)
                    } else {
                        $('#his-data').addClass('muting')
                        $('#his-mute-btn-text').text(lang.lang_status_unmute)
                    }
                }
            }
        }
    })
}
function muteMenu() {
    $('#muteDuration').toggleClass('hide')
    !$('#muteDuration').hasClass('hide') ? $('#his-des').css('max-height', '112px') : $('#his-des').css('max-height', '196px')
}
function muteTime(day, hour, min) {
    $('#days_mute').val(day)
    $('#hours_mute').val(hour)
    $('#mins_mute').val(min)
}

//投稿削除
function del(id, acct_id) {
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    if (localStorage.getItem('mode_' + domain) == 'misskey') {
        var start = 'https://' + domain + '/api/notes/delete'
        var httpreq = new XMLHttpRequest()
        httpreq.open('POST', start, true)
        httpreq.setRequestHeader('Content-Type', 'application/json')
        httpreq.responseType = 'json'
        httpreq.send(JSON.stringify({ i: at, noteId: id }))
        $('[toot-id=' + id + ']').hide()
        $('[toot-id=' + id + ']').remove()
    } else {
        var start = 'https://' + domain + '/api/v1/statuses/' + id
        var httpreq = new XMLHttpRequest()
        httpreq.open('DELETE', start, true)
        httpreq.setRequestHeader('Content-Type', 'application/json')
        httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
        httpreq.responseType = 'json'
        httpreq.send()
    }
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            if (this.status !== 200) {
                setLog(start, this.status, this.response)
            }
        }
    }
}
//redraft
function redraft(id, acct_id) {
    Swal.fire({
        title: lang.lang_status_redraftTitle,
        text: lang.lang_status_redraft,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: lang.lang_yesno,
        cancelButtonText: lang.lang_no,
    }).then((result) => {
        if (result.value) {
            show()
            var domain = localStorage.getItem('domain_' + acct_id)
            var at = localStorage.getItem('acct_' + acct_id + '_at')
            if (localStorage.getItem('mode_' + domain) == 'misskey') {
                var start = 'https://' + domain + '/api/notes/delete'
                var httpreq = new XMLHttpRequest()
                httpreq.open('POST', start, true)
                httpreq.setRequestHeader('Content-Type', 'application/json')
                httpreq.responseType = 'json'
                httpreq.send(JSON.stringify({ i: at, noteId: id }))
                $('[toot-id=' + id + ']').hide()
                $('[toot-id=' + id + ']').remove()
            } else {
                var start = 'https://' + domain + '/api/v1/statuses/' + id
                var httpreq = new XMLHttpRequest()
                httpreq.open('DELETE', start, true)
                httpreq.setRequestHeader('Content-Type', 'application/json')
                httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
                httpreq.responseType = 'json'
                httpreq.send()
            }
            httpreq.onreadystatechange = function() {
                if (httpreq.readyState === 4) {
                    if (this.status !== 200) {
                        setLog(start, this.status, this.response)
                    }
                    var json = httpreq.response
                    draftToPost(json, acct_id, id)
                }
            }
        }
    })
}

function draftToPost(json, acct_id, id) {
    $('#post-acct-sel').prop('disabled', true)
    $('#post-acct-sel').val(acct_id)
    $('select').formSelect()
    mdCheck()
    mediack = null
    if (json.media_attachments) mediack = json.media_attachments[0]
        //メディアがあれば
    var media_ids = []
    if (mediack) {
        for (var i = 0; i <= 4; i++) {
            if (json.media_attachments[i]) {
                media_ids.push(json.media_attachments[i].id)
                $('#preview').append('<img src="' + json.media_attachments[i].preview_url + '" style="width:50px; max-height:100px;">')
            } else {
                break
            }
        }
    }
    var vismode = json.visibility
    vis(vismode)
    var medias = media_ids.join(',')
    $('#media').val(medias)
    localStorage.setItem('nohide', true)
    show()
    if (json.text) {
        var html = json.text
    } else {
        var html = json.status
        html = html.replace(/^<p>(.+)<\/p>$/, '$1')
        html = html.replace(/<br\s?\/?>/, '\n')
        html = html.replace(/<p>/, '\n')
        html = html.replace(/<\/p>/, '\n')
        html = html.replace(/<img[\s\S]*alt="(.+?)"[\s\S]*?>/g, '$1')
        html = $.strip_tags(html)
    }
    $('#textarea').val(html)
    if (json.spoiler_text) {
        cw(true)
        $('#cw-text').val(json.spoiler_text)
    }
    if (json.sensitive) {
        $('#nsfw').addClass('yellow-text')
        $('#nsfw').html('visibility')
        $('#nsfw').addClass('nsfw-avail')
    }
    if (json.in_reply_to_id) {
        $('#reply').val(json.in_reply_to_id)
    }
}
//ピン留め
function pin(id, acct_id) {
    if ($(`.cvo[unique-id=${id}]`).hasClass('pined')) {
        var flag = 'unpin'
    } else {
        var flag = 'pin'
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/statuses/' + id + '/' + flag
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send()
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, this.response)
            }
            console.log(['Success: pinned', json])
            if (flag == 'unpin') {
                $('[toot-id=' + id + ']').removeClass('pined')
                $('.pin_' + id).removeClass('blue-text')
                $('.pinStr_' + id).text(lang.lang_parse_pin)
            } else {
                $('[toot-id=' + id + ']').addClass('pined')
                $('.pin_' + id).addClass('blue-text')
                $('.pinStr_' + id).text(lang.lang_parse_unpin)
            }
        }
    }
}

//フォロリク
function request(id, flag, acct_id) {
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/follow_requests/' + id + '/' + flag
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send()
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, this.response)
            }
            console.log(['Success: request', 'type:' + flag, json])
            showReq()
        }
    }
}

//ドメインブロック(未実装)
function domainblock(add, flag, acct_id) {
    if (!acct_id) {
        var acct_id = $('#his-data').attr('use-acct')
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/domain_blocks'
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send()
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, this.response)
            }
            console.log(['Success: domain block', json])
            showDom()
        }
    }
}

function addDomainblock() {
    var domain = $('#domainblock').val()
    domainblock(domain, 'POST')
}
//ユーザー強調
function empUser() {
    var usr = localStorage.getItem('user_emp')
    var obj = JSON.parse(usr)
    var id = $('#his-acct').attr('fullname')
    if (!obj) {
        var obj = []
        obj.push(id)
        M.toast({ html: id + lang.lang_status_emphas, displayLength: 4000 })
    } else {
        var can
        Object.keys(obj).forEach(function(key) {
            var usT = obj[key]
            if (usT != id && !can) {
                can = false
            } else {
                can = true
                obj.splice(key, 1)
                M.toast({ html: id + lang.lang_status_unemphas, displayLength: 4000 })
            }
        })
    }
    var json = JSON.stringify(obj)
    localStorage.setItem('user_emp', json)
}
//Endorse
function pinUser() {
    var id = $('#his-data').attr('user-id')
    var acct_id = $('#his-data').attr('use-acct')
    if ($('#his-end-btn').hasClass('endorsed')) {
        var flag = 'unpin'
    } else {
        var flag = 'pin'
    }
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v1/accounts/' + id + '/' + flag
    var httpreq = new XMLHttpRequest()
    httpreq.open('POST', start, true)
    httpreq.setRequestHeader('Content-Type', 'application/json')
    httpreq.setRequestHeader('Authorization', 'Bearer ' + at)
    httpreq.responseType = 'json'
    httpreq.send()
    httpreq.onreadystatechange = function() {
        if (httpreq.readyState === 4) {
            var json = httpreq.response
            if (this.status !== 200) {
                setLog(start, this.status, this.response)
            }
            if ($('#his-end-btn').hasClass('endorsed')) {
                $('#his-end-btn').removeClass('endorsed')
                $('#his-end-btn').text(lang.lang_status_endorse)
            } else {
                $('#his-end-btn').addClass('endorsed')
                $('#his-end-btn').text(lang.lang_status_unendorse)
            }
        }
    }
}
//URLコピー
function tootUriCopy(url) {
    execCopy(url)
    M.toast({ html: lang.lang_details_url, displayLength: 1500 })
}

//他のアカウントで…
function staEx(mode) {
    var url = $('#tootmodal').attr('data-url')
    var acct_id = $('#status-acct-sel').val()
    var domain = localStorage.getItem('domain_' + acct_id)
    var at = localStorage.getItem('acct_' + acct_id + '_at')
    var start = 'https://' + domain + '/api/v2/search?resolve=true&q=' + url
    fetch(start, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                Authorization: 'Bearer ' + at,
            },
        })
        .then(function(response) {
            if (!response.ok) {
                response.text().then(function(text) {
                    setLog(response.url, response.status, text)
                })
            }
            return response.json()
        })
        .catch(function(error) {
            todo(error)
            setLog(start, 'JSON', error)
            console.error(error)
        })
        .then(function(json) {
            if (json.statuses) {
                if (json.statuses[0]) {
                    var id = json.statuses[0].id
                    if (mode == 'rt') {
                        rt(id, acct_id, 'remote')
                    } else if (mode == 'fav') {
                        fav(id, acct_id, 'remote')
                    } else if (mode == 'reply') {
                        reEx(id)
                    }
                }
            }
        })
    return
}

function toggleAction(elm) {
    console.log(elm)
    const instance = M.Dropdown.init(elm)
    console.log(instance.isOpen)
    instance.open()
}