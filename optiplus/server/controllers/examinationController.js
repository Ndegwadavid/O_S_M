const db = require('../config/database');

const getWaitingClients = async (req, res) => {
    try {
        const [clients] = await db.query(
            'SELECT * FROM clients WHERE status = "waiting_examination" ORDER BY created_at ASC'
        );
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExamination = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const { rightEye, leftEye, clinicalHistory } = req.body;
        
        // Insert prescription
        await connection.query(
            `INSERT INTO prescriptions (
                client_id, right_eye_sph, right_eye_cyl, right_eye_axis,
                right_eye_va, right_eye_add, right_eye_ipd,
                left_eye_sph, left_eye_cyl, left_eye_axis,
                left_eye_va, left_eye_add, left_eye_ipd,
                clinical_history, examined_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.params.id,
                rightEye.sph, rightEye.cyl, rightEye.axis,
                rightEye.va, rightEye.add, rightEye.ipd,
                leftEye.sph, leftEye.cyl, leftEye.axis,
                leftEye.va, leftEye.add, leftEye.ipd,
                clinicalHistory,
                req.user.username
            ]
        );
        
        // Update client status
        await connection.query(
            'UPDATE clients SET status = "examined" WHERE id = ?',
            [req.params.id]
        );
        
        await connection.commit();
        res.json({ message: 'Examination updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};

module.exports = {
    getWaitingClients,
    updateExamination
};