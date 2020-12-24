const BLANK = "";
const CAN_NOT_EAT_ME = "자신을 꿀꺽할 수 없다냥!";
const CAN_NOT_LEARNING = "냥습할 수 없다냥!";
const EMPTY_EATING_POCKET = "꿀꺽주머니에 아무것도 없다냥!";
const FORCIBLY_DIGEST = "소화제를 사용해서 강제로 소화했다냥!";
const FULL_CHARGING = "풀 차지 상태다냥!!";
const HAVE_NOT_LEARNING = "냥습한게 없다냥!";
const HAVE_NOT_TARGET = "꿀꺽할 사람이 없다냥!";
const IS_CHARGING = "충전 중이다냥!";
const IS_NOT_CHARGING = "충전 중이 아니다냥!";
const IS_NOT_INT = "정수가 아니다냥!";
const IS_NOT_RANK = "그런 순위는 없다냥!";
const NOT_IN_RANGE = "수가 범위를 초과했다냥!";
const OK = "냥!";
const SECRET = "이 정보는 1급기밀이다냥!";
const SHOW_WHAT = "무엇을 낸 거냥?";
const TOO_SHORT = "너무 짧다냥!";

function confirm_learn(learning, who) {
    return learning+", "+who+"님이 냥습시켰다냥!";
}

function show_prev_msg(msg, who) {
    return msg+", "+who+"님이다냥!";
}

function show_phone_version(version) {
    return "v"+version+" 이다냥!";
}

function show_phone_battery(battery) {
    return battery+"% 남았다냥!";
}

function show_phone_voltage(voltage) {
    return voltage+"mV 이다냥!";
}

function show_phone_temperature(temperature) {
    return temperature+"℃ 이다냥!";
}

function show_today(year, month, date) {
    return year+"년 "+month+"월 "+date+"일이다냥!";
}

function show_today_day(day) {
    return day+"요일이다냥!";
}

function say_hello(sender) {
    return sender+"님 "+lib.choose(["환영한다냥!", "반갑다냥!", "어서오라냥!"]);
}

function response_brown_nyan() {
    return lib.choose(["냥?", "냐앙?", "왜 불렀냥?", "무슨 일이냥?"]);
}

function show_your_name(brown_nyan, master) {
    return brown_nyan+"이다냥! "+master+"과 친구다냥!";
}

function show_my_name(sender) {
    return sender+"님이다냥!";
}

function rsp_tie(bot) {
    return bot+"! "+lib.choose(["무승부다냥!", "비겼다냥!"]);
}

function rsp_win(bot) {
    return bot+"! 내가 이겼다냥!";
}

function rsp_lose(bot) {
    return bot+"! 내가 졌다냥..";
}

function escape(target) {
    return target+"님을 꿀꺽하려고 했지만, 도망갔다냥!";
}

function eat(target) {
    return target+"님을 꿀꺽했다냥!";
}

function vomit(target) {
    return target+"님을 뱉었다냥!";
}

function len_between_a_and_b(a, b) {
    return "길이는 "+a+"~"+b+" 사이여야 한다냥!";
}

function show(a) {
    return a+" 이다냥!";
}

const obj = {
    BLANK: BLANK,
    CAN_NOT_EAT_ME: CAN_NOT_EAT_ME,
    CAN_NOT_LEARNING: CAN_NOT_LEARNING,
    EMPTY_EATING_POCKET: EMPTY_EATING_POCKET,
    FORCIBLY_DIGEST: FORCIBLY_DIGEST,
    FULL_CHARGING: FULL_CHARGING,
    HAVE_NOT_LEARNING: HAVE_NOT_LEARNING,
    HAVE_NOT_TARGET: HAVE_NOT_TARGET,
    IS_CHARGING: IS_CHARGING,
    IS_NOT_CHARGING: IS_NOT_CHARGING,
    IS_NOT_INT: IS_NOT_INT,
    IS_NOT_RANK: IS_NOT_RANK,
    NOT_IN_RANGE: NOT_IN_RANGE,
    OK: OK,
    SECRET: SECRET,
    SHOW_WHAT: SHOW_WHAT,
    TOO_SHORT: TOO_SHORT,

    confirm_learn: confirm_learn,
    show_prev_msg: show_prev_msg,
    show_phone_version: show_phone_version,
    show_phone_battery: show_phone_battery,
    show_phone_voltage: show_phone_voltage,
    show_phone_temperature: show_phone_temperature,
    show_today: show_today,
    show_today_day: show_today_day,
    say_hello: say_hello,
    response_brown_nyan: response_brown_nyan,
    show_your_name: show_your_name,
    show_my_name: show_my_name,
    rsp_tie: rsp_tie,
    rsp_win: rsp_win,
    rsp_lose: rsp_lose,
    escape: escape,
    eat: eat,
    vomit: vomit,
    len_between_a_and_b: len_between_a_and_b,
    show: show
};

module.exports = obj;
