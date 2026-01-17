const { MongoClient } = require('mongodb');

class TruthDAO {
    constructor() {
        this.collection = null;
    }

    async initialize(db) {
        this.collection = db.collection('dao_cases');
    }

    // Escalate a case to DAO vote
    async escalateCase(query, analysis, initialScore) {
        const caseData = {
            query,
            analysis,
            initialScore,
            status: 'pending',
            votes: [],
            createdAt: new Date(),
            votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };

        const result = await this.collection.insertOne(caseData);
        return result.insertedId;
    }

    // Submit a vote
    async submitVote(caseId, voterAddress, vote, reasoning) {
        // Enforce uniqueness: Check if user has already voted
        const existingCase = await this.collection.findOne({
            _id: caseId,
            "votes.voterAddress": voterAddress
        });

        if (existingCase) {
            throw new Error("User has already voted on this case");
        }

        const vote_data = {
            voterAddress,
            vote, // 'true' or 'false'
            reasoning,
            timestamp: new Date(),
            stake: 10 // Proof of Stake (Simulated until Blockchain sync)
        };

        await this.collection.updateOne(
            { _id: caseId },
            { $push: { votes: vote_data } }
        );

        // Check if voting threshold is met (e.g., 10 votes)
        const case_doc = await this.collection.findOne({ _id: caseId });
        if (case_doc.votes.length >= 10) {
            await this.resolveCase(caseId);
        }
    }

    // Resolve case based on majority vote
    async resolveCase(caseId) {
        const case_doc = await this.collection.findOne({ _id: caseId });

        const trueVotes = case_doc.votes.filter(v => v.vote === 'true').length;
        const falseVotes = case_doc.votes.filter(v => v.vote === 'false').length;

        const finalVerdict = trueVotes > falseVotes ? 'true' : 'false';
        const consensusScore = Math.round((Math.max(trueVotes, falseVotes) / case_doc.votes.length) * 100);

        await this.collection.updateOne(
            { _id: caseId },
            {
                $set: {
                    status: 'resolved',
                    finalVerdict,
                    consensusScore,
                    resolvedAt: new Date()
                }
            }
        );

        return { finalVerdict, consensusScore };
    }

    // Get pending cases
    async getPendingCases() {
        return await this.collection.find({ status: 'pending' }).toArray();
    }

    // Get case by ID
    async getCase(caseId) {
        return await this.collection.findOne({ _id: caseId });
    }
}

module.exports = { TruthDAO };
