module.exports = {
  createLog: async (pool, logData) => {
    const { date, time, trans_id, mev_type, trade_amnt, expected_amnt, profit_percentage, original_loss_percentage } = logData;
    return pool.query(
      `INSERT INTO mev_logs (date, time, trans_id, mev_type, trade_amnt, expected_amnt, profit_percentage, original_loss_percentage) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [date, time, trans_id, mev_type, trade_amnt, expected_amnt, profit_percentage, original_loss_percentage]
    );
  },
  getAllLogs: async (pool) => {
    return pool.query("SELECT * FROM mev_logs ORDER BY date DESC, time DESC");
  },
};