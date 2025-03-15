export default {
	default: new Map([
		['msg_failed', 'Failed to read a card.'],
		['msg_tap_card', 'Tap a FeliCa card.'],
		['published_date', 'Published date'],
		['datetime', 'Datetime'],
		['device_type', 'Device'],
		['process_type', 'Type'],
		['value', 'Balance'],
		['details', 'Details'],
		['delta', 'Delta'],
		['outgo', 'Outgo'],
		['income', 'Income'],
		['edy-id', 'Edy #'],
		['suica-device_type-03', 'Fare Adjustment'], // のりこし精算機
		['suica-device_type-05', 'Bus/Trum'],
		['suica-device_type-07', 'Ticket Machine'],
		['suica-device_type-08', 'Ticket Machine'],
		['suica-device_type-09', 'Deposit Machine'], // ICOCAクイックチャージ機/nimocaポイント交換機
		['suica-device_type-12', 'Ticket Machine'],
		['suica-device_type-14', 'Ticket Window'],
		['suica-device_type-15', 'Ticket Machine'],
		['suica-device_type-16', 'Automatic Wicket'],
		['suica-device_type-17', 'Simple Wicket'],
		['suica-device_type-18', 'Ticket Window'], // 窓口/指定席券売機
		['suica-device_type-19', 'Ticket Window'], // 窓口処理機
		['suica-device_type-1a', 'Ticket Window'], // 窓口処理機
		['suica-device_type-1b', 'Card Writer'],
		['suica-device_type-1c', 'Fare Adjustment'],
		['suica-device_type-1d', 'Transfer Gate'], // 乗換改札機
		['suica-device_type-1f', 'Deposit Machine'],
		['suica-device_type-20', 'Ticket Window'], // 窓口端末
		['suica-device_type-21', 'Fare Adjustment'],
		['suica-device_type-22', 'Conventional Line Gate'],
		['suica-device_type-23', 'Shinkansen Gate'],
		['suica-device_type-24', 'Conductor Device'],
		['suica-device_type-46', 'VIEW ALTTE etc.'],
		['suica-device_type-48', 'nimoca Point Charger'],
		['suica-device_type-c7', 'Store'],
		['suica-device_type-c8', 'Vending Machine'],
		['suica-process_type-00', 'Window'], // 入出場
		['suica-process_type-01', 'Exit'],
		['suica-process_type-02', 'Charge'],
		['suica-process_type-03', 'Purchase'],
		['suica-process_type-04', 'Adjust'], // 磁気券精算
		['suica-process_type-05', 'Adjust'], // 乗越精算
		['suica-process_type-06', 'Window'], // 窓口出場
		['suica-process_type-07', 'Publish'],// 新規発行
		['suica-process_type-08', 'Deduct'], // 窓口控除
		['suica-process_type-09', 'Pay Flat-fee'], // バス/市電等
		['suica-process_type-0f', 'Pay in Car'], // バス/市電等
		['suica-process_type-11', 'Republish'],
		['suica-process_type-13', 'Exit Shinkansen'], // 料金出場
		['suica-process_type-14', 'Auto-charge (Exit)'],
		['suica-process_type-15', 'Auto-charge (Enter)'],
		['suica-process_type-17', 'Auto-charge (PiTaPa)'],
		['suica-process_type-19', 'Pay in Car'], // バス/市電等
		['suica-process_type-1a', 'Pay in Car'], // バス/市電等
		['suica-process_type-1b', 'Discounted Fare'],
		['suica-process_type-1c', 'Limousine'],
		['suica-process_type-1f', 'Charge in Car'],
		['suica-process_type-20', 'Exit outside Pass Area'], // 入出場記録
		['suica-process_type-23', 'Purchase Pass'],
		['suica-process_type-40', 'Exit in Pass Area'], // 入出場記録
		['suica-process_type-46', 'Shop'],
		['suica-process_type-48', 'Charge Points'],
		['suica-process_type-49', 'Charge at Store'],
		['suica-process_type-4b', 'Shop and Charge'],
		['suica-process_type-84', 'Adjust at Exit'],
		['suica-process_type-85', 'Adjust at Entrance'],
		['suica-process_type-a0', 'Enter outside Pass Area'], // 入出場記録
		['suica-process_type-c0', 'Enter inside Pass Area'], // 入出場記録
		['suica-process_type-c6', 'Shop with Cache'],
		['suica-process_type-cb', 'Shop and Enter w/ Cache'],
		['edy-process_type-02', 'Charge'],
		['edy-process_type-04', 'Gift'],
		['edy-process_type-20', 'Payment'],
		['waon-points', 'Points'],
		['waon-process_type-04', 'Payment'],
		['waon-process_type-08', 'Return'],
		['waon-process_type-0c', 'Charge'],
		['waon-process_type-18', 'Points'],
		['waon-process_type-1c', 'Auto Charge'],
		['waon-process_type-20', 'Auto Charge'],
		['waon-process_type-28', 'Return'],
		['waon-process_type-30', 'Auto Charge'],
		['waon-process_type-3c', 'Transition'],
		['waon-process_type-7c', 'Points'],
		['nanaco-id', 'nanaco #'],
		['nanaco-process_type-35', 'Transition'],
		['nanaco-process_type-47', 'Payment'],
		['nanaco-process_type-6f', 'Charge'],
		['nanaco-process_type-70', 'Charge'],
		['nanaco-process_type-83', 'Points'],
	]),
	ja: new Map([
		['msg_failed', 'カードを読み取れませんでした'],
		['msg_tap_card', 'FeliCaカードにかざしてください'],
		['published_date', '発行日'],
		['datetime', '日時'],
		['device_type', '端末'],
		['process_type', '種別'],
		['value', '残額'],
		['details', '備考'],
		['delta', '決済額'],
		['outgo', '支払'],
		['income', '入金'],
		['edy-id', 'Edy番号'],
		['suica-device_type-03', 'のりこし精算'], // のりこし精算機
		['suica-device_type-05', 'バス/市電等'],
		['suica-device_type-07', '自動券売'],
		['suica-device_type-08', '自動券売'],
		['suica-device_type-09', '入金機'], // ICOCAクイックチャージ機/nimocaポイント交換機
		['suica-device_type-12', '自動券売'],
		['suica-device_type-14', '窓口'],
		['suica-device_type-15', '定期券券売機'],
		['suica-device_type-16', '自動改札'],
		['suica-device_type-17', '簡易改札'],
		['suica-device_type-18', '窓口/指券'], // 窓口/指定席券売機
		['suica-device_type-19', '窓口'], // 窓口処理機
		['suica-device_type-1a', '窓口'], // 窓口処理機
		['suica-device_type-1b', 'カードライター'],
		['suica-device_type-1c', 'のりこし精算'],
		['suica-device_type-1d', '乗換改札'], // 乗換改札機
		['suica-device_type-1f', '入金機'],
		['suica-device_type-20', '窓口'], // 窓口端末
		['suica-device_type-21', '精算機'],
		['suica-device_type-22', '在来線改札'],
		['suica-device_type-23', '新幹線改札'],
		['suica-device_type-24', '車内補充券発行機'],
		['suica-device_type-46', 'VIEW ALTTE等'],
		['suica-device_type-48', 'nimocaポイント交換機'],
		['suica-device_type-c7', '店舗'],
		['suica-device_type-c8', '自動販売機'],
		['suica-process_type-00', '窓口処理'], // 入出場
		['suica-process_type-01', '出場'],
		['suica-process_type-02', '積増'],
		['suica-process_type-03', '磁気券購入'],
		['suica-process_type-04', '精算'], // 磁気券精算
		['suica-process_type-05', '精算'], // 乗越精算
		['suica-process_type-06', '窓口'], // 窓口出場
		['suica-process_type-07', '新規'],// 新規発行
		['suica-process_type-08', '控除'], // 窓口控除
		['suica-process_type-09', '均一精算'], // バス/市電等
		['suica-process_type-0f', '車内精算'], // バス/市電等
		['suica-process_type-11', '再発行'],
		['suica-process_type-13', '新幹線出場'], // 料金出場
		['suica-process_type-14', '自動積増(出場)'],
		['suica-process_type-15', '自動積増(入場)'],
		['suica-process_type-17', '自動積増(PiTaPa)'],
		['suica-process_type-19', '車内精算'], // バス/市電等
		['suica-process_type-1a', '車内精算'], // バス/市電等
		['suica-process_type-1b', '車内割引精算'],
		['suica-process_type-1c', 'リムジンバス等'],
		['suica-process_type-1f', '車内積増'],
		['suica-process_type-20', '定期外出場'], // 入出場記録
		['suica-process_type-23', '企画券購入'],
		['suica-process_type-40', '定期内出場'], // 入出場記録
		['suica-process_type-46', '物販'],
		['suica-process_type-48', 'PT入金'],
		['suica-process_type-49', 'レジ入金'],
		['suica-process_type-4b', '入金物販'],
		['suica-process_type-84', '他社精算'],
		['suica-process_type-85', '他社入場精算'],
		['suica-process_type-a0', '定期外入場'], // 入出場記録
		['suica-process_type-c0', '定期内入場'], // 入出場記録
		['suica-process_type-c6', '現金併用物販'],
		['suica-process_type-cb', '入場現金併用物販'],
		['edy-process_type-02', '入金'],
		['edy-process_type-04', 'ギフト'],
		['edy-process_type-20', '支払'],
		['waon-id', 'WAON番号'],
		['waon-points', 'WAONポイント'],
		['waon-process_type-04', '支払'],
		['waon-process_type-08', '返品'],
		['waon-process_type-0c', '入金'],
		['waon-process_type-18', 'PT入金'],
		['waon-process_type-1c', '自動入金'],
		['waon-process_type-20', '自動入金'],
		['waon-process_type-28', '返金'],
		['waon-process_type-30', '自動入金'],
		['waon-process_type-3c', '移行'],
		['waon-process_type-7c', 'PT交換'],
		['nanaco-id', 'nanaco番号'],
		['nanaco-process_type-35', '引継'],
		['nanaco-process_type-47', '支払'],
		['nanaco-process_type-6f', '入金'],
		['nanaco-process_type-70', '入金'],
		['nanaco-process_type-83', 'PT交換'],
	]),
};