export function validateMembers(members, total) {
  if (!Number.isSafeInteger(Number(total)) || Number(total) <= 0)
    return 'Total tagihan harus berupa nominal rupiah yang valid.';
  if (
    !members.length ||
    members.some((member) => !String(member.member_name ?? '').trim())
  )
    return 'Isi nama setiap peserta.';
  if (
    members.some(
      (member) =>
        !Number.isSafeInteger(Number(member.amount)) ||
        Number(member.amount) <= 0,
    )
  )
    return 'Nominal setiap peserta harus lebih dari nol dan berupa rupiah bulat.';
  if (
    members.reduce((sum, member) => sum + Number(member.amount), 0) !==
    Number(total)
  )
    return 'Jumlah pembagian harus sama dengan total tagihan.';
  return '';
}
