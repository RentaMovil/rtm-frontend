import i18n from '../../../../Traductions/index.js';

function ValidateDate(value) {  //esta funcionn toma una gecha elgida por el usuario  y valida que no sea anterior a la fecha actual ni posterior a dos meses desde hoy
    if (!value) return i18n.t('MaintenanceForm.invalidDate');

    const selectDate = new Date(value);//crea un bjeto a partir de el vvalor recibido
    const today = new Date();  // crea un objeto con la fecha actual

    // aca se normalizan las horas de ambos objetos a 00:00:00 para comparar solo las fechas sin considerar la hora
    today.setHours(0, 0, 0, 0);
    selectDate.setHours(0, 0, 0, 0);

    const limitDate = new Date(today);// se crea un nuevo objeto a partir de la fecha actual para calcular la fecha limite
    limitDate.setMonth(limitDate.getMonth() + 2);// esto solo suna dos meses a la fecha actual

    if (selectDate < today) {
        return i18n.t('MaintenanceForm.dateBeforeToday');
    }
    if (selectDate > limitDate) {
        return i18n.t('MaintenanceForm.dateAfterTwoMonths');
    }

    return true;
}

export default ValidateDate;