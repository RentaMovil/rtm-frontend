/**
 * Versión publicada de los términos de reserva.
 *
 * IMPORTANTE: este contenido es una base comercial editable. La razón social,
 * NIT, domicilio, canales de atención y política definitiva de cancelación,
 * reembolso y depósito deben ser completados y validados por un abogado antes
 * de publicar el sistema en producción. Al modificar el texto, incremente la
 * versión para que las aceptaciones anteriores sigan siendo auditables.
 */
export const RENTAL_TERMS_VERSION = "2026-09-24";

const RENTAL_TERMS_EFFECTIVE_DATES = {
    es: "24 de septiembre de 2026",
    en: "September 24, 2026",
    fr: "24 septembre 2026",
    pt: "24 de setembro de 2026",
};

export const RENTAL_TERMS_EFFECTIVE_DATE = RENTAL_TERMS_EFFECTIVE_DATES.es;

export const DEFAULT_RENTAL_LANGUAGE = "es";

const rentalTermsSectionsByLanguage = {
    es: [
        {
            id: "objeto",
            title: "1. Objeto y aceptación",
            paragraphs: [
                "Estos términos y condiciones regulan el acceso a la plataforma RentaMóvil y la reserva y alquiler de vehículos mediante ella. La aceptación de la casilla de autorización, la fecha, la versión y los datos de la reserva seleccionada constituyen evidencia digital de aceptación de este documento.",
                "El cliente declara que los ha leído y comprendido en su totalidad. Si no está de acuerdo con alguna de sus disposiciones, no debe continuar con la reserva ni realizar el pago.",
            ],
        },
        {
            id: "requisitos",
            title: "2. Requisitos del cliente y del conductor",
            paragraphs: [
                "El cliente declara que tiene la edad mínima exigida por la normativa aplicable, que posee licencia de conducción vigente y válida durante todo el período del alquiler, y que cuenta con autorización y capacidad para celebrar este contrato.",
                "Al momento de la entrega deberá presentar los documentos de identidad, licencia y demás requisitos informados en la reserva o en la sucursal. Cualquier conductor adicional deberá ser autorizado previamente por RentaMóvil. La entrega de información falsa, vencida o insuficiente podrá suspender o cancelar el servicio, sin perjuicio de los derechos que correspondan al cliente.",
            ],
        },
        {
            id: "reserva",
            title: "3. Selección, disponibilidad y precio",
            paragraphs: [
                "La reserva representa una solicitud sujeta a verificación de disponibilidad, datos, cobertura elegida y pago. RentaMóvil podrá ofrecer un vehículo equivalente de la misma categoría cuando sea necesario, informando la diferencia de precio, si existe, y obteniendo la aprobación del cliente cuando este cambio afecte de manera sustancial lo contratado.",
                "El total que aparece en la plataforma corresponde a los productos, fechas, sucursales, cobertura y servicios seleccionados. Los impuestos incluidos se identifican expresamente en la pantalla de pago. Peajes, parqueos, multas, consumos y otros cargos de terceros se pagarán por el cliente cuando así lo indique la ley o el servicio prestado.",
            ],
        },
        {
            id: "pago",
            title: "4. Pago, comprobante y activación de la reserva",
            paragraphs: [
                "El pago debe realizarse exclusivamente por los canales y cuentas bancarias habilitados y vigentes mostrados en la plataforma. El cliente debe transferir el valor indicado y registrar un comprobante legible que permita relacionarlo con la reserva.",
                "El envío del comprobante no equivale a aprobación del pago ni confirma por sí solo la reserva. El estado permanece pendiente de revisión hasta que un administrador valide la transferencia. Un pago rechazado, una referencia incorrecta, una diferencia de monto o un comprobante no legible no activará el servicio. El comprobante no debe compartirse con terceros fuera de los canales autorizados.",
            ],
        },
        {
            id: "cambios",
            title: "5. Cambios, cancelación y reembolsos",
            paragraphs: [
                "Las solicitudes de cambio o cancelación deben presentarse por los canales oficiales antes de la fecha y hora de recogida. Se aplicarán las condiciones, plazos, costos y penalidades que se muestren expresamente en la oferta y que el cliente acepte al confirmar la reserva. Si no existe una condición especial visible, RentaMóvil informará el costo aplicable antes de procesar la solicitud.",
                "No procederá un reembolso por servicios ya prestados, gastos ante terceros, daños imputables al cliente o casos previstos en la normativa aplicable, sin perjuicio de los derechos irrenunciables del consumidor y de las reglas específicas de la cobertura elegida.",
            ],
        },
        {
            id: "entrega",
            title: "6. Entrega del vehículo",
            paragraphs: [
                "La entrega se realiza en la sucursal, fecha y franja horaria confirmadas, sujeta a disponibilidad y a la presentación oportuna de los documentos requeridos. El cliente debe recibir y revisar el vehículo antes de retirarse de la sucursal.",
                "La entrega incluye una revisión de apariencia, kilometraje, combustible, accesorios y funcionamiento básico, cuyo resultado se registra en el documento de entrega. Cualquier daño, faltante o defecto que no quede registrado debe comunicarse antes de iniciar la marcha.",
            ],
        },
        {
            id: "deposito",
            title: "7. Depósito de garantía y pagos a terceros",
            paragraphs: [
                "Cuando corresponda, el cliente deberá constituir un depósito o entregar un medio de garantía conforme al monto y mecanismo informados en la reserva o en el contrato de alquiler. Ese depósito es una garantía de cumplimiento y no un pago de la reserva, salvo que se indique expresamente lo contrario.",
                "El depósito se liberará una vez devuelto el vehículo y verificados el estado, la documentación, el combustible, el kilometraje y la ausencia de obligaciones. Si existen daños, multas u otras sumas pendientes, se podrá descontar el importe comprobado, respetando las notificaciones, el proceso y los derechos del cliente.",
            ],
        },
        {
            id: "uso",
            title: "8. Uso permitido y prohibiciones",
            paragraphs: [
                "El vehículo solo podrá utilizarse para desplazamientos lícitos por el conductor autorizado. Quedan prohibidos, entre otros, el uso bajo efectos de alcohol o drogas, carreras, competencias, pruebas de velocidad, conducción fuera de vía, sobrecarga, uso comercial no autorizado, subarriendo, abandono del vehículo, retiro o manipulación del dispositivo GPS y cualquier actividad ilícita.",
                "El conductor debe respetar la normativa de tránsito, las señales, las restricciones de circulación y las órdenes legítimas de la autoridad. El cliente responderá por las consecuencias del uso indebido, sin perjuicio de las coberturas contratadas.",
            ],
        },
        {
            id: "responsabilidad",
            title: "9. Responsabilidad, incidentes y seguros",
            paragraphs: [
                "El cliente debe conducir de manera prudente y comunicar de inmediato a RentaMóvil, a la autoridad competente y, cuando corresponda, a su aseguradora cualquier accidente, robo, daño o incidente. No debe realizar reparaciones ni desplazar el vehículo sin autorización, salvo una medida urgente para evitar un daño mayor.",
                "El cliente será responsable de multas, peajes, parqueos, daños y pérdidas a terceros en la proporción que le corresponda legalmente. La cobertura de seguro elegida opera únicamente dentro de su alcance, límites y deducible; no sustituye las responsabilidades no cubiertas. El resumen de la cobertura seleccionada forma parte de la reserva.",
            ],
        },
        {
            id: "devolucion",
            title: "10. Devolución y extensión",
            paragraphs: [
                "El vehículo debe devolverse en la sucursal, fecha y hora indicadas, con el mismo nivel de combustible, kilometraje, accesorios, documentos y estado de calidad, salvo el desgaste ordinario permitido. La devolución se documentará mediante una inspección y acta de entrega.",
                "Cualquier extensión debe solicitarse antes de la hora de devolución y está sujeta a disponibilidad y a la tarifa vigente. No produce una extensión automática la demora en la devolución. Una devolución tardía o fuera de la sucursal convenida puede generar cobros adicionales y, cuando corresponda, la aplicación de la garantía.",
            ],
        },
        {
            id: "disponibilidad",
            title: "11. Disponibilidad y eventos de fuerza mayor",
            paragraphs: [
                "RentaMóvil podrá modificar o cancelar una reserva por motivos de seguridad, mantenimiento, falta de disponibilidad u otra causa justificada, informando al cliente. En ese caso se gestionará la devolución de los importes correspondientes a servicios no prestados, de acuerdo con la ley y con lo ya consumido por el cliente.",
                "Eventos de fuerza mayor, disturbios, restricciones de circulación, emergencias u otras circunstancias fuera de control razonable pueden modificar fechas, rutas o condiciones. El cliente deberá usar los canales oficiales para recibir instrucciones y opciones.",
            ],
        },
        {
            id: "datos",
            title: "12. Datos personales y comunicaciones",
            paragraphs: [
                "Los datos suministrados se utilizarán para gestionar la reserva, verificar el pago, prestar soporte, cumplir obligaciones legales, prevenir fraude y mantener la seguridad de la plataforma. El tratamiento se realizará conforme a la normativa de protección de datos y a los avisos de privacidad y finalidades que RentaMóvil informará al cliente.",
                "Las comunicaciones operativas —por ejemplo, recordatorios, estado de pago e instrucciones de entrega— podrán realizarse por los canales registrados. El uso comercial de los datos o las comunicaciones de marketing requieren la autorización separada que exija la ley.",
            ],
        },
        {
            id: "derechos",
            title: "13. Propiedad intelectual y límites de responsabilidad",
            paragraphs: [
                "La plataforma, su diseño, textos, logotipos, fotografías y demás componentes se utilizan exclusivamente para facilitar el servicio. El cliente no podrá reproducirlos, modificarlos o explotarlos comercialmente sin autorización previa.",
                "En la medida permitida por la ley, RentaMóvil no responde por daños indirectos o lucro cesante derivados de la utilización de la plataforma. Esta limitación no excluye responsabilidades que no puedan ser excluidas, ni los derechos del consumidor. El cliente debe utilizar el servicio de forma lícita y responsable.",
            ],
        },
        {
            id: "vigencia",
            title: "14. Vigencia, ley aplicable y contacto",
            paragraphs: [
                "Esta versión rige para las reservas iniciadas desde su publicación. Los cambios se publicarán con una nueva versión y fecha; la versión aceptada por cada cliente se conservará con la evidencia de aceptación. No se aplicarán a una reserva ya aceptada modificaciones que afecten derechos adquiridos sin autorización expresa o base legal.",
                "La relación se rige por la legislación colombiana. Cualquier controversia se resolverá por los mecanismos de solución aplicables y por los jueces y tribunales competentes, sin perjuicio de las normas de protección al consumidor. Para consultas, el cliente puede usar los canales oficiales publicados en la plataforma o acudir a la sucursal relacionada con la reserva.",
            ],
        },
    ],
    en: [
        {
            id: "objeto",
            title: "1. Object and acceptance",
            paragraphs: [
                "These terms and conditions govern access to the RentaMóvil platform and the booking and rental of vehicles through it. By accepting the checkbox, the date, the version and the data of the selected reservation constitute digital evidence of acceptance of this document.",
                "The customer declares that they have read and understood them in full. If they do not agree with any provision, they must not proceed with the reservation or make payment.",
            ],
        },
        {
            id: "requisitos",
            title: "2. Customer and driver requirements",
            paragraphs: [
                "The customer declares that they meet the minimum age required by applicable law, that they hold a valid driver's license for the entire rental period, and that they have the authority and capacity to enter into this contract.",
                "At the time of delivery, they must present identification, a valid license and any other requirements stated in the reservation or at the branch. Any additional driver must be authorized in advance by RentaMóvil. Providing false, expired or insufficient information may suspend or cancel the service, without prejudice to the customer's rights.",
            ],
        },
        {
            id: "reserva",
            title: "3. Selection, availability and price",
            paragraphs: [
                "The reservation is a request subject to verification of availability, data, selected coverage and payment. RentaMóvil may offer an equivalent vehicle in the same category when necessary, informing the customer of any price difference and obtaining approval if the change substantially affects the contracted service.",
                "The total shown corresponds to the products, dates, branches, coverage and services selected. Included taxes are expressly identified on the payment screen. Tolls, parking fees, fines, consumables and other third-party charges shall be paid by the customer when required by law or the service provided.",
            ],
        },
        {
            id: "pago",
            title: "4. Payment, receipt and activation",
            paragraphs: [
                "Payment must be made exclusively through the authorized, valid bank channels and accounts displayed on the platform. The customer must transfer the exact amount indicated and upload a legible receipt that allows it to be linked to the reservation.",
                "Submitting the receipt does not constitute payment approval or confirm the reservation. The reservation remains pending review until an administrator validates the transfer. A rejected payment, incorrect reference, amount mismatch or illegible receipt will not activate the service. The receipt must not be shared with third parties outside authorized channels.",
            ],
        },
        {
            id: "cambios",
            title: "5. Changes, cancellation and refunds",
            paragraphs: [
                "Requests to change or cancel must be submitted through official channels before the scheduled pickup date and time. The conditions, deadlines, costs and penalties shown in the offer and accepted at confirmation will apply. If no specific condition is visible, RentaMóvil will inform the applicable cost before processing the request.",
                "Refunds will not be granted for services already provided, third-party expenses, damage attributable to the customer, or cases provided for by applicable law, without prejudice to the consumer's non-waivable rights and the specific rules of the selected coverage.",
            ],
        },
        {
            id: "entrega",
            title: "6. Vehicle delivery",
            paragraphs: [
                "Delivery takes place at the confirmed branch, date and time slot, subject to availability and timely presentation of the required documents. The customer must inspect the vehicle before leaving the branch.",
                "Delivery includes verification of appearance, mileage, fuel, accessories and basic operation, recorded in the delivery document. Any damage, missing items or defects not recorded must be reported before driving off.",
            ],
        },
        {
            id: "deposito",
            title: "7. Security deposit and third-party payments",
            paragraphs: [
                "When applicable, the customer must provide a security deposit or authorized guarantee for the amount and by the method indicated in the reservation or rental agreement. The deposit is a guarantee of performance, not a reservation payment unless expressly stated otherwise.",
                "The deposit will be released once the vehicle is returned and its condition, documentation, fuel, mileage and absence of outstanding obligations have been verified. If damage, fines or other charges exist, the verified amount may be deducted, with due notice and respect for the customer's rights.",
            ],
        },
        {
            id: "uso",
            title: "8. Permitted use and prohibitions",
            paragraphs: [
                "The vehicle may only be used for lawful purposes by an authorized driver. Prohibited uses include, but are not limited to: driving under the influence of alcohol or drugs, racing, competitions, speed tests, off-road driving, overloading, unauthorized commercial use, subleasing, abandonment, removal or tampering with the GPS device, and any unlawful activity.",
                "The driver must comply with traffic laws, signs, circulation restrictions and legitimate orders from authorities. The customer is responsible for the consequences of improper use, without prejudice to contracted coverages.",
            ],
        },
        {
            id: "responsabilidad",
            title: "9. Liability, incidents and insurance",
            paragraphs: [
                "The customer must drive prudently and immediately notify RentaMóvil, the relevant authority and, where applicable, their insurer of any accident, theft, damage or incident. Repairs or vehicle relocation must not be carried out without authorization, except in urgent cases to prevent greater damage.",
                "The customer is liable for fines, tolls, parking fees, damage and third-party losses to the extent legally required. The selected insurance coverage only applies within its scope, limits and deductible; it does not replace uncovered liabilities. The summary of the selected coverage forms part of the reservation.",
            ],
        },
        {
            id: "devolucion",
            title: "10. Return and extension",
            paragraphs: [
                "The vehicle must be returned to the branch, date and time indicated, with the same fuel level, mileage, accessories, documents and general condition, except for reasonable wear and tear. Return is documented via inspection and a return record.",
                "Any extension must be requested before the return time and is subject to availability and current rates. Delay in return does not automatically extend the rental. Late return or return to a different branch may incur additional charges and, if applicable, application of the security deposit.",
            ],
        },
        {
            id: "disponibilidad",
            title: "11. Availability and force majeure",
            paragraphs: [
                "RentaMóvil may modify or cancel a reservation for safety, maintenance, unavailability or other justified reasons, notifying the customer. In such cases, amounts for unprovided services will be refunded in accordance with the law and amounts already consumed by the customer.",
                "Force majeure, disturbances, circulation restrictions, emergencies or other circumstances beyond reasonable control may change dates, routes or conditions. The customer must use official channels to receive instructions and available options.",
            ],
        },
        {
            id: "datos",
            title: "12. Personal data and communications",
            paragraphs: [
                "The data provided will be used to manage the reservation, verify payment, provide support, comply with legal obligations, prevent fraud and maintain platform security. Processing will be carried out in accordance with data protection laws and RentaMóvil's privacy notices and stated purposes.",
                "Operational communications (e.g., reminders, payment status, delivery instructions) may be sent through registered channels. Commercial use of data or marketing communications requires separate authorization as required by law.",
            ],
        },
        {
            id: "derechos",
            title: "13. Intellectual property and liability limits",
            paragraphs: [
                "The platform, its design, texts, logos, photos and other elements are used solely to facilitate the service. The customer may not reproduce, modify or commercially exploit them without prior authorization.",
                "To the extent permitted by law, RentaMóvil is not liable for indirect damages or lost profits arising from use of the platform. This limitation does not exclude liabilities that cannot be excluded or consumer rights. The customer must use the service lawfully and responsibly.",
            ],
        },
        {
            id: "vigencia",
            title: "14. Validity, applicable law and contact",
            paragraphs: [
                "This version applies to reservations made from its publication date. Changes will be published with a new version and date; the version accepted by each customer will be preserved with acceptance evidence. Modifications that affect acquired rights will not apply to an already accepted reservation without express consent or legal basis.",
                "The relationship is governed by Colombian law. Disputes shall be resolved through applicable dispute resolution mechanisms and competent courts, without prejudice to consumer protection rules. For inquiries, the customer may use official channels published on the platform or contact the branch related to the reservation.",
            ],
        },
    ],
    fr: [
        {
            id: "objeto",
            title: "1. Objet et acceptation",
            paragraphs: [
                "Ces conditions générales régissent l'accès à la plateforme RentaMóvil ainsi que la réservation et la location de véhicules via celle-ci. L'acceptation de la case à cocher, la date, la version et les données de la réservation constituent une preuve numérique de l'acceptation de ce document.",
                "Le client déclare avoir lu et compris l'intégralité de ces conditions. S'il n'accepte pas certaines dispositions, il ne doit ni poursuivre sa réservation ni effectuer de paiement.",
            ],
        },
        {
            id: "requisitos",
            title: "2. Exigences relatives au client et au conducteur",
            paragraphs: [
                "Le client déclare satisfaire à l'âge minimum requis par la législation applicable, détenir un permis de conduire valide pour toute la durée de la location et avoir l'autorité et la capacité de conclure ce contrat.",
                "À la remise du véhicule, il doit présenter une pièce d'identité, son permis de conduire et tout autre document exigé par la réservation ou par l'agence. Tout conducteur supplémentaire doit être autorisé au préalable par RentaMóvil. La fourniture d'informations fausses, expirées ou incomplètes peut entraîner la suspension ou l'annulation du service, sans préjudice des droits du client.",
            ],
        },
        {
            id: "reserva",
            title: "3. Sélection, disponibilité et prix",
            paragraphs: [
                "La réservation est une demande soumise à la vérification de la disponibilité, des données, de la couverture choisie et du paiement. RentaMóvil peut proposer un véhicule équivalent de la même catégorie si nécessaire, en informant le client de toute différence de prix et en obtenant son accord si ce changement affecte substantiellement le service contracté.",
                "Le total indiqué correspond aux produits, dates, agences, couvertures et services sélectionnés. Les taxes incluses sont clairement identifiées sur l'écran de paiement. Les péages, frais de stationnement, amendes, consommables et autres frais tiers sont à la charge du client lorsque la loi ou le service l'exige.",
            ],
        },
        {
            id: "pago",
            title: "4. Paiement, justificatif et activation",
            paragraphs: [
                "Le paiement doit être effectué exclusivement via les canaux bancaires et comptes autorisés et valides indiqués sur la plateforme. Le client doit virer le montant exact indiqué et télécharger un justificatif lisible permettant de le relier à la réservation.",
                "Le dépôt du justificatif ne constitue pas une approbation du paiement ni une confirmation de la réservation. Celle-ci reste en attente de validation jusqu'à ce qu'un administrateur valide le virement. Un paiement rejeté, une référence incorrecte, un écart de montant ou un justificatif illisible n'activera pas le service. Le justificatif ne doit pas être partagé avec des tiers en dehors des canaux autorisés.",
            ],
        },
        {
            id: "cambios",
            title: "5. Modifications, annulation et remboursements",
            paragraphs: [
                "Les demandes de modification ou d'annulation doivent être soumises via les canaux officiels avant la date et l'heure de prise en charge. Les conditions, délais, coûts et pénalités indiqués dans l'offre et acceptés lors de la confirmation s'appliquent. Si aucune condition spécifique n'est visible, RentaMóvil informera le coût applicable avant de traiter la demande.",
                "Aucun remboursement ne sera accordé pour des services déjà fournis, des dépenses tierces, des dommages imputables au client ou des cas prévus par la loi applicable, sans préjudice des droits non renonçables du consommateur et des règles spécifiques de la couverture choisie.",
            ],
        },
        {
            id: "entrega",
            title: "6. Remise du véhicule",
            paragraphs: [
                "La remise a lieu à l'agence, à la date et à l'heure confirmées, sous réserve de disponibilité et de présentation en temps utile des documents requis. Le client doit inspecter le véhicule avant de quitter l'agence.",
                "La remise comprend la vérification de l'état, du kilométrage, du carburant, des accessoires et du fonctionnement de base, enregistrés sur le document de remise. Tout dommage, élément manquant ou défaut non enregistré doit être signalé avant de prendre la route.",
            ],
        },
        {
            id: "deposito",
            title: "7. Caution et paiements à des tiers",
            paragraphs: [
                "Le cas échéant, le client doit verser une caution ou fournir une garantie selon le montant et le mode indiqués dans la réservation ou le contrat de location. Cette caution garantit l'exécution du contrat et n'est pas un paiement de réservation, sauf indication contraire expresse.",
                "La caution est libérée après restitution du véhicule et vérification de son état, des documents, du carburant, du kilométrage et de l'absence de dettes. Si des dommages, amendes ou autres charges sont constatés, le montant justifié peut être déduit, dans le respect de la notification et des droits du client.",
            ],
        },
        {
            id: "uso",
            title: "8. Utilisation autorisée et interdictions",
            paragraphs: [
                "Le véhicule ne peut être utilisé qu'à des fins licites par un conducteur autorisé. Sont notamment interdits : la conduite sous l'influence de l'alcool ou de stupéfiants, la course, les compétitions, les essais de vitesse, la conduite hors route, la surcharge, l'usage commercial non autorisé, la sous-location, l'abandon, le retrait ou la manipulation du GPS et toute activité illégale.",
                "Le conducteur doit respecter le code de la route, les panneaux, les restrictions de circulation et les ordres légitimes des autorités. Le client répond des conséquences d'une utilisation incorrecte, sans préjudice des couvertures contractées.",
            ],
        },
        {
            id: "responsabilidad",
            title: "9. Responsabilité, incidents et assurance",
            paragraphs: [
                "Le client doit conduire prudemment et signaler immédiatement à RentaMóvil, aux autorités compétentes et, le cas échéant, à son assureur tout accident, vol, dommage ou incident. Aucune réparation ni déplacement du véhicule ne doit être effectué sans autorisation, sauf en cas d'urgence pour éviter un dommage plus important.",
                "Le client est responsable des amendes, péages, frais de stationnement, dommages et préjudices causés à des tiers dans la mesure prévue par la loi. La couverture d'assurance choisie s'applique uniquement dans son champ d'application, ses limites et son franchise ; elle ne remplace pas les responsabilités non couvertes. Le résumé de la couverture fait partie intégrante de la réservation.",
            ],
        },
        {
            id: "devolucion",
            title: "10. Restitution et prolongation",
            paragraphs: [
                "Le véhicule doit être restitué à l'agence, à la date et à l'heure indiquées, avec le même niveau de carburant, le même kilométrage, les accessoires, les documents et un état comparable, à l'exception d'une usure normale. La restitution est documentée par un contrôle et un acte de restitution.",
                "Toute prolongation doit être demandée avant l'heure de restitution et est soumise à la disponibilité et au tarif en vigueur. Un retard ne prolonge pas automatiquement la location. Une restitution tardive ou dans une autre agence peut entraîner des frais supplémentaires et, le cas échéant, l'application de la caution.",
            ],
        },
        {
            id: "disponibilidad",
            title: "11. Disponibilité et force majeure",
            paragraphs: [
                "RentaMóvil peut modifier ou annuler une réservation pour des raisons de sécurité, de maintenance, d'indisponibilité ou toute autre raison justifiée, en en informant le client. Dans ce cas, les montants correspondant à des services non fournis seront remboursés conformément à la loi et compte tenu des montants déjà consommés.",
                "La force majeure, les troubles, les restrictions de circulation, les urgences ou d'autres circonstances hors de contrôle raisonnable peuvent modifier les dates, itinéraires ou conditions. Le client doit utiliser les canaux officiels pour recevoir instructions et options.",
            ],
        },
        {
            id: "datos",
            title: "12. Données personnelles et communications",
            paragraphs: [
                "Les données fournies seront utilisées pour gérer la réservation, vérifier le paiement, fournir une assistance, respecter les obligations légales, prévenir la fraude et assurer la sécurité de la plateforme. Le traitement sera conforme aux lois sur la protection des données et aux avis de confidentialité et finalités de RentaMóvil.",
                "Les communications opérationnelles (rappels, état du paiement, instructions de remise) peuvent être envoyées via les canaux enregistrés. L'utilisation commerciale des données ou les communications marketing nécessitent une autorisation distincte, conformément à la loi.",
            ],
        },
        {
            id: "derechos",
            title: "13. Propriété intellectuelle et limites de responsabilité",
            paragraphs: [
                "La plateforme, sa conception, ses textes, logos, photos et autres éléments sont utilisés uniquement pour faciliter le service. Le client ne peut ni les reproduire, ni les modifier, ni les exploiter à des fins commerciales sans autorisation préalable.",
                "Dans la mesure permise par la loi, RentaMóvil n'est pas responsable des dommages indirects ou pertes de profits liés à l'utilisation de la plateforme. Cette limitation n'exclut pas les responsabilités qui ne peuvent être exclues ni les droits des consommateurs. Le client doit utiliser le service de manière licite et responsable.",
            ],
        },
        {
            id: "vigencia",
            title: "14. Durée de validité, loi applicable et contact",
            paragraphs: [
                "Cette version s'applique aux réservations effectuées à compter de sa date de publication. Les modifications sont publiées avec une nouvelle version et une nouvelle date ; la version acceptée par chaque client est conservée avec la preuve d'acceptation. Les modifications affectant des droits acquis ne s'appliqueront pas à une réservation déjà acceptée sans consentement exprès ou fondement légal.",
                "La relation est régie par le droit colombien. Tout litige sera résolu par les mécanismes de règlement applicables et les tribunaux compétents, sans préjudice des règles de protection des consommateurs. Pour toute question, le client peut utiliser les canaux officiels publiés sur la plateforme ou contacter l'agence concernée par la réservation.",
            ],
        },
    ],
    pt: [
        {
            id: "objeto",
            title: "1. Objeto e aceitação",
            paragraphs: [
                "Estes termos e condições regem o acesso à plataforma RentaMóvil e a reserva e locação de veículos por meio dela. A aceitação da caixa de seleção, da data, da versão e dos dados da reserva selecionada constituem prova digital da aceitação deste documento.",
                "O cliente declara que leu e compreendeu integralmente estes termos. Caso não concorde com alguma disposição, não deve prosseguir com a reserva nem efetuar o pagamento.",
            ],
        },
        {
            id: "requisitos",
            title: "2. Requisitos do cliente e do condutor",
            paragraphs: [
                "O cliente declara que possui a idade mínima exigida pela legislação aplicável, que detém uma carteira de habilitação válida durante todo o período da locação e que tem autoridade e capacidade para celebrar este contrato.",
                "No momento da entrega, deve apresentar documento de identidade, carteira de habilitação e demais requisitos informados na reserva ou na filial. Qualquer condutor adicional deve ser previamente autorizado pela RentaMóvil. O fornecimento de informações falsas, vencidas ou insuficientes pode suspender ou cancelar o serviço, sem prejuízo dos direitos do cliente.",
            ],
        },
        {
            id: "reserva",
            title: "3. Seleção, disponibilidade e preço",
            paragraphs: [
                "A reserva é uma solicitação sujeita à verificação de disponibilidade, dados, cobertura selecionada e pagamento. A RentaMóvil poderá oferecer um veículo equivalente da mesma categoria, quando necessário, informando ao cliente qualquer diferença de preço e obtendo sua aprovação caso a alteração afete substancialmente o serviço contratado.",
                "O valor total exibido corresponde aos produtos, datas, filiais, coberturas e serviços selecionados. Os impostos incluídos são expressamente identificados na tela de pagamento. Pedágios, estacionamento, multas, consumíveis e outros encargos de terceiros serão pagos pelo cliente quando exigido por lei ou pelo serviço prestado.",
            ],
        },
        {
            id: "pago",
            title: "4. Pagamento, comprovante e ativação",
            paragraphs: [
                "O pagamento deve ser efetuado exclusivamente pelos canais bancários e contas autorizados e válidos exibidos na plataforma. O cliente deve transferir o valor exato indicado e enviar um comprovante legível que permita vinculá-lo à reserva.",
                "O envio do comprovante não equivale à aprovação do pagamento nem confirma a reserva. A reserva permanece pendente de análise até que um administrador valide a transferência. Pagamentos rejeitados, referência incorreta, divergência de valor ou comprovante ilegível não ativarão o serviço. O comprovante não deve ser compartilhado com terceiros fora dos canais autorizados.",
            ],
        },
        {
            id: "cambios",
            title: "5. Alterações, cancelamento e reembolsos",
            paragraphs: [
                "Solicitações de alteração ou cancelamento devem ser feitas pelos canais oficiais antes da data e hora de retirada. Aplicar-se-ão as condições, prazos, custos e penalidades exibidos na oferta e aceitos na confirmação. Caso nenhuma condição específica seja exibida, a RentaMóvil informará o custo aplicável antes de processar a solicitação.",
                "Não haverá reembolso por serviços já prestados, despesas de terceiros, danos atribuíveis ao cliente ou casos previstos na legislação aplicável, sem prejuízo dos direitos irrenunciáveis do consumidor e das regras específicas da cobertura selecionada.",
            ],
        },
        {
            id: "entrega",
            title: "6. Entrega do veículo",
            paragraphs: [
                "A entrega ocorre na filial, na data e no horário confirmados, sujeita à disponibilidade e à apresentação tempestiva dos documentos exigidos. O cliente deve inspecionar o veículo antes de deixá-lo na filial.",
                "A entrega inclui verificação da aparência, quilometragem, combustível, acessórios e funcionamento básico, registrados no documento de entrega. Quaisquer danos, itens faltantes ou defeitos não registrados devem ser comunicados antes de iniciar a viagem.",
            ],
        },
        {
            id: "deposito",
            title: "7. Caução e pagamentos a terceiros",
            paragraphs: [
                "Quando aplicável, o cliente deve constituir uma caução ou fornecer garantia conforme o valor e o método indicados na reserva ou no contrato de locação. A caução é garantia de cumprimento, não um pagamento da reserva, salvo disposição expressa em contrário.",
                "A caução será liberada após a devolução do veículo e verificação de seu estado, documentação, combustível, quilometragem e ausência de obrigações pendentes. Se houver danos, multas ou outros encargos comprovados, o valor correspondente poderá ser descontado, respeitando a notificação e os direitos do cliente.",
            ],
        },
        {
            id: "uso",
            title: "8. Uso permitido e proibições",
            paragraphs: [
                "O veículo só pode ser utilizado para fins lícitos por condutor autorizado. São proibidos, entre outros: condução sob influência de álcool ou drogas, corridas, competições, testes de velocidade, condução fora de estrada, sobrecarga, uso comercial não autorizado, sublocação, abandono, remoção ou adulteração do dispositivo GPS e qualquer atividade ilícita.",
                "O condutor deve cumprir as leis de trânsito, sinalização, restrições de circulação e ordens legítimas das autoridades. O cliente responde pelas consequências do uso indevido, sem prejuízo das coberturas contratadas.",
            ],
        },
        {
            id: "responsabilidad",
            title: "9. Responsabilidade, incidentes e seguro",
            paragraphs: [
                "O cliente deve conduzir com prudência e notificar imediatamente a RentaMóvil, à autoridade competente e, quando aplicável, à sua seguradora sobre qualquer acidente, roubo, dano ou incidente. Não devem ser realizadas reparos nem o veículo deve ser deslocado sem autorização, exceto em caso de urgência para evitar danos maiores.",
                "O cliente é responsável por multas, pedágios, estacionamento, danos e prejuízos a terceiros na medida legalmente exigida. A cobertura de seguro selecionada opera apenas dentro de seu alcance, limites e franquia; não substitui responsabilidades não cobertas. O resumo da cobertura selecionada integra a reserva.",
            ],
        },
        {
            id: "devolucion",
            title: "10. Devolução e prorrogação",
            paragraphs: [
                "O veículo deve ser devolvido na filial, na data e hora indicadas, com o mesmo nível de combustível, quilometragem, acessórios, documentos e estado geral, exceto desgaste normal. A devolução é documentada por meio de inspeção e termo de devolução.",
                "Qualquer prorrogação deve ser solicitada antes do horário de devolução e está sujeita à disponibilidade e à tarifa vigente. A demora na devolução não prorroga automaticamente o prazo. A devolução tardia ou em filial diferente pode gerar encargos adicionais e, quando aplicável, a aplicação da caução.",
            ],
        },
        {
            id: "disponibilidad",
            title: "11. Disponibilidade e caso fortuito/força maior",
            paragraphs: [
                "A RentaMóvil poderá modificar ou cancelar uma reserva por motivos de segurança, manutenção, indisponibilidade ou outro motivo justificado, informando o cliente. Nesses casos, os valores referentes a serviços não prestados serão reembolsados conforme a lei e considerando os valores já consumidos pelo cliente.",
                "Caso fortuito ou força maior, distúrbios, restrições de circulação, emergências ou outras circunstâncias fora do controle razoável podem alterar datas, rotas ou condições. O cliente deve usar os canais oficiais para receber instruções e opções disponíveis.",
            ],
        },
        {
            id: "datos",
            title: "12. Dados pessoais e comunicações",
            paragraphs: [
                "Os dados fornecidos serão usados para gerenciar a reserva, verificar o pagamento, prestar suporte, cumprir obrigações legais, prevenir fraudes e manter a segurança da plataforma. O tratamento será realizado conforme as leis de proteção de dados e os avisos de privacidade e finalidades da RentaMóvil.",
                "Comunicações operacionais (lembretes, status do pagamento, instruções de entrega) podem ser enviadas pelos canais registrados. O uso comercial dos dados ou comunicações de marketing requer autorização específica, conforme exigido por lei.",
            ],
        },
        {
            id: "derechos",
            title: "13. Propriedade intelectual e limites de responsabilidade",
            paragraphs: [
                "A plataforma, seu design, textos, logotipos, fotos e outros elementos são usados exclusivamente para facilitar o serviço. O cliente não pode reproduzi-los, modificá-los ou explorá-los comercialmente sem autorização prévia.",
                "Na medida permitida por lei, a RentaMóvil não responde por danos indiretos ou lucros cessantes decorrentes do uso da plataforma. Esta limitação não exclui responsabilidades que não possam ser excluídas nem direitos do consumidor. O cliente deve usar o serviço de forma lícita e responsável.",
            ],
        },
        {
            id: "vigencia",
            title: "14. Vigência, lei aplicável e contato",
            paragraphs: [
                "Esta versão se aplica a reservas iniciadas a partir de sua data de publicação. Alterações serão publicadas com nova versão e data; a versão aceita por cada cliente será conservada com a prova de aceitação. Alterações que afetem direitos adquiridos não se aplicarão a reservas já aceitas sem consentimento expresso ou base legal.",
                "O relacionamento é regido pela legislação colombiana. Eventuais controvérsias serão resolvidas pelos mecanismos de solução aplicáveis e pelos tribunais competentes, sem prejuízo das normas de proteção ao consumidor. Para dúvidas, o cliente pode usar os canais oficiais publicados na plataforma ou entrar em contato com a filial relacionada à reserva.",
            ],
        },
    ],
};

export function getRentalTermsEffectiveDate(lang) {
    const language = String(lang ?? DEFAULT_RENTAL_LANGUAGE).toLowerCase();
    return RENTAL_TERMS_EFFECTIVE_DATES[language] ?? RENTAL_TERMS_EFFECTIVE_DATES[DEFAULT_RENTAL_LANGUAGE];
}

export function getRentalTermsSections(lang) {
    const language = String(lang ?? DEFAULT_RENTAL_LANGUAGE).toLowerCase();
    return rentalTermsSectionsByLanguage[language] ?? rentalTermsSectionsByLanguage[DEFAULT_RENTAL_LANGUAGE];
}

export function createTermsAcceptance() {
    return {
        accepted: true,
        version: RENTAL_TERMS_VERSION,
        acceptedAt: new Date().toISOString(),
    };
}

export function isValidTermsAcceptance(acceptance) {
    if (
        acceptance?.accepted !== true ||
        acceptance.version !== RENTAL_TERMS_VERSION ||
        typeof acceptance.acceptedAt !== "string"
    ) {
        return false;
    }

    return Number.isFinite(Date.parse(acceptance.acceptedAt));
}
