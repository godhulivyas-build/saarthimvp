export type AwarenessItem = {
  id: string;
  type: 'scheme' | 'workshop' | 'local';
  titleHi: string;
  titleEn: string;
  detailHi: string;
  detailEn: string;
};

export const awarenessItems: AwarenessItem[] = [
  {
    id: '1',
    type: 'scheme',
    titleHi: 'PM-KISAN किस्त',
    titleEn: 'PM-KISAN installment',
    detailHi: 'अगली किस्त जल्द। ई-केवाईसी जाँच करें।',
    detailEn: 'Next installment soon. Check e-KYC status.',
  },
  {
    id: '2',
    type: 'workshop',
    titleHi: 'जैविक खेती कार्यशाला',
    titleEn: 'Organic farming workshop',
    detailHi: 'ब्लॉक स्तर पर 28 तारीख — निःशुल्क पंजीकरण।',
    detailEn: 'Block-level on 28th — free registration.',
  },
  {
    id: '3',
    type: 'local',
    titleHi: 'मंडी समय बदला',
    titleEn: 'Mandi timing change',
    detailHi: 'गर्मी में सुबह 6–11 बजे तक।',
    detailEn: 'Summer hours 6–11 AM.',
  },
  {
    id: '4',
    type: 'scheme',
    titleHi: 'फसल बीमा याद दिलाना',
    titleEn: 'Crop insurance reminder',
    detailHi: 'अगले सप्ताह आखिरी तारीख हो सकती है।',
    detailEn: 'Deadline may be next week — verify on portal.',
  },
];
