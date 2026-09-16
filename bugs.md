* [ ] #1 Tiendanube > Auditoría de Precios: Al filtrar por "Sin Costo ERP" en la tabla se muestran productos pero el contador de la parte superior dice "0".
  * [X] Verificación: no se replica en MercadoLibre.
* [ ] #2 MercadoLibre > Sincronizador ERP: El motor de sincronización aplica leaky bucket de 2/s cuando no es aplicable a MercadoLibre, solo a Tiendanube.
* [ ] #3 Indicadores numericos que dan informacion sobre productos en tiempo real: deberían mostrar un placeholder o al menos un indicador de que aun se está calculando mientras se está realizando nuevamente una auditoría o proceso que modifique estos indicadores. Hoy no es claro y en la UI se siguen viendo mientras se actualiza la información de la API y se actualizan instantáneamente cuando la información se actualiza.
